using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);
var jwtSecret = builder.Configuration["Auth:JwtSecret"];
if (string.IsNullOrWhiteSpace(jwtSecret))
{
    if (!builder.Environment.IsDevelopment())
        throw new InvalidOperationException("Configura Auth__JwtSecret mediante una variable de entorno.");

    jwtSecret = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
}
var jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalWeb", policy => policy
        .WithOrigins(
            "http://localhost:5500",
            "http://127.0.0.1:5500",
            "http://localhost:49366",
            "http://127.0.0.1:49366",
            "https://ambitious-ground-0e3dfc61e.3.azurestaticapps.net")
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = jwtKey,
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddOpenApi();

var app = builder.Build();

string CreateJwtToken(int userId, string email)
{
    var descriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email)
        }),
        Expires = DateTime.UtcNow.AddHours(8),
        SigningCredentials = new SigningCredentials(jwtKey, SecurityAlgorithms.HmacSha256)
    };
    var handler = new JwtSecurityTokenHandler();
    return handler.WriteToken(handler.CreateToken(descriptor));
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("LocalWeb");
app.UseAuthentication();
app.UseAuthorization();
app.UseStaticFiles();

app.MapGet("/api/database/status", async (IConfiguration configuration) =>
{
    await using var connection = new SqlConnection(
        configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        "SELECT DB_NAME(), @@SERVERNAME;", connection);
    await using var reader = await command.ExecuteReaderAsync();
    await reader.ReadAsync();

    return Results.Ok(new
    {
        connected = true,
        database = reader.GetString(0),
        server = reader.GetString(1)
    });
});

app.MapGet("/api/database/tables", async (IConfiguration configuration) =>
{
    await using var connection = new SqlConnection(
        configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        """
        SELECT TABLE_SCHEMA, TABLE_NAME
        FROM INFORMATION_SCHEMA.TABLES
        WHERE TABLE_TYPE = 'BASE TABLE'
        ORDER BY TABLE_SCHEMA, TABLE_NAME;
        """, connection);
    await using var reader = await command.ExecuteReaderAsync();

    var tables = new List<object>();
    while (await reader.ReadAsync())
    {
        tables.Add(new
        {
            schema = reader.GetString(0),
            name = reader.GetString(1)
        });
    }

    return Results.Ok(tables);
});

app.MapGet("/api/exercises", async (IConfiguration configuration) =>
{
    await using var connection = new SqlConnection(
        configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        """
            SELECT id, nombre, descripcion, duracion_seg, video_url
        FROM dbo.ejercicios
        ORDER BY id;
        """, connection);
    await using var reader = await command.ExecuteReaderAsync();

    var exercises = new List<object>();
    while (await reader.ReadAsync())
    {
        exercises.Add(new
        {
            id = reader.GetInt32(0),
            name = reader.GetString(1),
            description = reader.GetString(2),
                durationSeconds = reader.GetInt32(3),
                videoUrl = reader.IsDBNull(4) ? null : reader.GetString(4)
            });
        }

        return Results.Ok(exercises);
});

app.MapPost("/api/auth/login", async (LoginRequest request, IConfiguration configuration) =>
{
    var email = request.Email?.Trim().ToLowerInvariant();
    if (!IsValidEmail(email) || string.IsNullOrWhiteSpace(request.Password))
    {
        return Results.BadRequest(new { message = "Correo y contraseña son obligatorios." });
    }

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        "SELECT id, nombre_completo, email, password_hash FROM dbo.usuarios WHERE email = @email;",
        connection);
    command.Parameters.AddWithValue("@email", email);
    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync() || !VerifyPassword(request.Password, reader.GetString(3)))
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new
    {
        id = reader.GetInt32(0),
        name = reader.GetString(1),
        email = reader.GetString(2),
        token = CreateJwtToken(reader.GetInt32(0), reader.GetString(2))
    });
});

app.MapGet("/api/progress/{userId:int}", async (int userId, ClaimsPrincipal user, IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, userId);
    if (access is not null) return access;

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        """
        SELECT u.nombre_completo, u.nivel, u.minutos_totales, u.puntos_totales,
          (SELECT COUNT(*) FROM dbo.usuario_medallas WHERE usuario_id = u.id) AS medallas,
          (SELECT COUNT(*) FROM dbo.sesiones_entrenamiento
             WHERE usuario_id = u.id AND estado = N'completada') AS ejercicios_completados
        FROM dbo.usuarios u WHERE u.id = @userId;
        SELECT CAST(inicio AS date), SUM(minutos)
        FROM dbo.sesiones_entrenamiento
        WHERE usuario_id = @userId AND inicio >= DATEADD(day, -6, CAST(GETDATE() AS date))
        GROUP BY CAST(inicio AS date);
        SELECT CAST(inicio AS date), COUNT(*)
        FROM dbo.sesiones_entrenamiento
        WHERE usuario_id = @userId AND estado = N'completada'
          AND inicio >= DATEADD(day, -6, CAST(GETDATE() AS date))
        GROUP BY CAST(inicio AS date);
        SELECT TOP 10 s.id, CAST(s.inicio AS date), e.nombre, s.minutos, s.puntos
        FROM dbo.sesiones_entrenamiento s
        INNER JOIN dbo.sesion_ejercicios se ON se.sesion_id = s.id
        INNER JOIN dbo.ejercicios e ON e.id = se.ejercicio_id
        WHERE s.usuario_id = @userId AND s.estado = N'completada'
        ORDER BY s.inicio DESC;
        SELECT m.nombre, m.descripcion, um.obtenida_en
        FROM dbo.usuario_medallas um
        INNER JOIN dbo.medallas m ON m.id = um.medalla_id
        WHERE um.usuario_id = @userId
        ORDER BY um.obtenida_en DESC;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);
    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync()) return Results.NotFound();
    var summary = new
    {
        name = reader.GetString(0),
        level = reader.GetInt32(1),
        totalMinutes = reader.GetInt32(2),
        totalPoints = reader.GetInt32(3),
        medals = Convert.ToInt32(reader.GetValue(4)),
        completedExercises = Convert.ToInt32(reader.GetValue(5))
    };
    await reader.NextResultAsync();
    var weekly = new Dictionary<string, int>();
    while (await reader.ReadAsync())
    {
        weekly[reader.GetDateTime(0).ToString("yyyy-MM-dd")] = Convert.ToInt32(reader.GetValue(1));
    }

    await reader.NextResultAsync();
    var weeklyExercises = new Dictionary<string, int>();
    while (await reader.ReadAsync())
    {
        weeklyExercises[reader.GetDateTime(0).ToString("yyyy-MM-dd")] = Convert.ToInt32(reader.GetValue(1));
    }

    await reader.NextResultAsync();
    var history = new List<object>();
    while (await reader.ReadAsync())
    {
        history.Add(new
        {
            id = Convert.ToInt32(reader.GetValue(0)),
            date = reader.GetDateTime(1).ToString("yyyy-MM-dd"),
            exercise = reader.GetString(2),
            minutes = reader.GetInt32(3),
            points = reader.GetInt32(4)
        });
    }

    await reader.NextResultAsync();
    var medals = new List<object>();
    while (await reader.ReadAsync())
    {
        medals.Add(new
        {
            name = reader.GetString(0),
            description = reader.IsDBNull(1) ? string.Empty : reader.GetString(1),
            earnedAt = reader.GetDateTime(2).ToString("yyyy-MM-dd")
        });
    }

    return Results.Ok(new { summary, weekly, weeklyExercises, history, medals });
}).RequireAuthorization();

    // Calendar & Streak endpoint - returns 90 days of activity + current streak
    app.MapGet("/api/progress/{userId:int}/calendar", async (int userId, ClaimsPrincipal user, IConfiguration configuration) => {
        var access = CheckUserAccess(user, userId);
        if (access is not null) return access;

        await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
        await connection.OpenAsync();

        // Get last 90 days of completed sessions
        await using var command = new SqlCommand(
            """
            SELECT CAST(inicio AS date) as fecha, COUNT(*) as sesiones, SUM(minutos) as minutos
            FROM dbo.sesiones_entrenamiento
            WHERE usuario_id = @userId AND estado = N'completada'
              AND inicio >= DATEADD(day, -89, CAST(GETDATE() AS date))
            GROUP BY CAST(inicio AS date)
            ORDER BY fecha;
            """, connection);
        command.Parameters.AddWithValue("@userId", userId);

        var calendar = new Dictionary<string, object>();
        await using var reader = await command.ExecuteReaderAsync();
        while (await reader.ReadAsync()) {
            var fecha = reader.GetDateTime(0).ToString("yyyy-MM-dd");
            calendar[fecha] = new {
                sessions = Convert.ToInt32(reader.GetValue(1)),
                minutes = Convert.ToInt32(reader.GetValue(2))
            };
        }

        // Calculate current streak (consecutive days with at least 1 completed session)
        int streak = 0;
        var today = DateTime.Today;
        for (int i = 0; i < 90; i++) {
            var checkDate = today.AddDays(-i).ToString("yyyy-MM-dd");
            if (calendar.ContainsKey(checkDate)) {
                streak++;
            } else if (i == 0) {
                // Today has no session yet, check yesterday
                continue;
            } else {
                break;
            }
        }

        // Longest streak in the 90-day window
        int longestStreak = 0;
        int currentStreak = 0;
        for (int i = 89; i >= 0; i--) {
            var checkDate = today.AddDays(-i).ToString("yyyy-MM-dd");
            if (calendar.ContainsKey(checkDate)) {
                currentStreak++;
                longestStreak = Math.Max(longestStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }

        return Results.Ok(new { calendar, currentStreak, longestStreak });
    }).RequireAuthorization();

app.MapGet("/api/goals/{userId:int}", async (int userId, ClaimsPrincipal user, IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, userId);
    if (access is not null) return access;

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        """
        SELECT tipo, objetivo, semana_inicio
        FROM dbo.metas_usuario
        WHERE usuario_id = @userId;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);
    await using var reader = await command.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
        return Results.Ok(new { type = "minutes", target = 150, weekStart = (DateTime?)null });

    return Results.Ok(new
    {
        type = reader.GetString(0),
        target = reader.GetInt32(1),
        weekStart = reader.GetDateTime(2).ToString("yyyy-MM-dd")
    });
});

app.MapPut("/api/goals", async (SaveGoalRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, request.UserId);
    if (access is not null) return access;

    if (request.UserId <= 0 ||
        !new[] { "minutes", "exercises" }.Contains(request.Type) ||
        request.Target < 1 || request.Target > 10000)
    {
        return Results.BadRequest(new { message = "La meta no es válida." });
    }

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var command = new SqlCommand(
        """
        IF NOT EXISTS (SELECT 1 FROM dbo.usuarios WHERE id = @userId)
            THROW 50011, 'Usuario no encontrado.', 1;

        UPDATE dbo.metas_usuario
        SET tipo = @type,
            objetivo = @target,
            semana_inicio = DATEADD(day, -(DATEDIFF(day, 0, CAST(GETDATE() AS date)) % 7), CAST(GETDATE() AS date)),
            actualizado_en = SYSUTCDATETIME()
        WHERE usuario_id = @userId;

        IF @@ROWCOUNT = 0
            INSERT INTO dbo.metas_usuario (usuario_id, tipo, objetivo, semana_inicio)
            VALUES (@userId, @type, @target,
              DATEADD(day, -(DATEDIFF(day, 0, CAST(GETDATE() AS date)) % 7), CAST(GETDATE() AS date)));
        """, connection);
    command.Parameters.AddWithValue("@userId", request.UserId);
    command.Parameters.AddWithValue("@type", request.Type);
    command.Parameters.AddWithValue("@target", request.Target);

    try
    {
        await command.ExecuteNonQueryAsync();
        return Results.Ok(new { type = request.Type, target = request.Target });
    }
    catch (SqlException exception) when (exception.Number == 50011)
    {
        return Results.NotFound(new { message = "No se encontró el usuario." });
    }
}).RequireAuthorization();

app.MapPost("/api/progress/complete", async (
    CompleteExerciseRequest request,
    ClaimsPrincipal user,
    IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, request.UserId);
    if (access is not null) return access;

    if (request.UserId <= 0 || request.ExerciseId <= 0)
        return Results.BadRequest(new { message = "El usuario y el ejercicio son obligatorios." });

    var minutes = Math.Max(1, (int)Math.Ceiling(request.DurationSeconds / 60d));
    var points = Math.Max(10, request.DurationSeconds / 2);
    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

    try
    {
        var verifyUserCommand = new SqlCommand(
            "UPDATE dbo.usuarios SET email_verificado = 1 WHERE id = @userId;",
            connection, transaction);
        verifyUserCommand.Parameters.AddWithValue("@userId", request.UserId);
        if (await verifyUserCommand.ExecuteNonQueryAsync() == 0)
        {
            await transaction.RollbackAsync();
            return Results.NotFound(new { message = "No se encontró el usuario." });
        }

        var sessionCommand = new SqlCommand(
            """
            INSERT INTO dbo.sesiones_entrenamiento
              (usuario_id, rutina_id, inicio, fin, minutos, puntos, porcentaje_avance, estado)
            VALUES (@userId, @routineId, DATEADD(second, -@seconds, SYSUTCDATETIME()),
              SYSUTCDATETIME(), @minutes, @points, 100, 'completada');
            SELECT CAST(SCOPE_IDENTITY() AS bigint);
            """, connection, transaction);
        sessionCommand.Parameters.AddWithValue("@userId", request.UserId);
        sessionCommand.Parameters.AddWithValue("@routineId", request.RoutineId ?? 1);
        sessionCommand.Parameters.AddWithValue("@seconds", request.DurationSeconds);
        sessionCommand.Parameters.AddWithValue("@minutes", minutes);
        sessionCommand.Parameters.AddWithValue("@points", points);
        var sessionId = (long)(await sessionCommand.ExecuteScalarAsync()
            ?? throw new InvalidOperationException("No se pudo guardar la sesión."));

        var exerciseCommand = new SqlCommand(
            """
            INSERT INTO dbo.sesion_ejercicios
              (sesion_id, ejercicio_id, porcentaje_precision, puntos, completado)
            VALUES (@sessionId, @exerciseId, 100, @points, 1);
            """, connection, transaction);
        exerciseCommand.Parameters.AddWithValue("@sessionId", sessionId);
        exerciseCommand.Parameters.AddWithValue("@exerciseId", request.ExerciseId);
        exerciseCommand.Parameters.AddWithValue("@points", points);
        await exerciseCommand.ExecuteNonQueryAsync();

        var userCommand = new SqlCommand(
            """
            UPDATE dbo.usuarios
            SET minutos_totales = minutos_totales + @minutes,
                puntos_totales = puntos_totales + @points,
                nivel = 1 + ((puntos_totales + @points) / 500)
            WHERE id = @userId;
            """, connection, transaction);
        userCommand.Parameters.AddWithValue("@minutes", minutes);
        userCommand.Parameters.AddWithValue("@points", points);
        userCommand.Parameters.AddWithValue("@userId", request.UserId);
        await userCommand.ExecuteNonQueryAsync();

        var medalCommand = new SqlCommand(
            """
            INSERT INTO dbo.usuario_medallas (usuario_id, medalla_id, obtenida_en)
            SELECT @userId, m.id, SYSUTCDATETIME()
            FROM dbo.medallas m
            CROSS JOIN dbo.usuarios u
            WHERE u.id = @userId
              AND NOT EXISTS (
                SELECT 1
                FROM dbo.usuario_medallas um
                WHERE um.usuario_id = @userId AND um.medalla_id = m.id
              )
              AND (
                (m.nombre = N'Primer paso')
                OR (m.nombre = N'Trío activo' AND
                  (SELECT COUNT(*) FROM dbo.sesiones_entrenamiento
                   WHERE usuario_id = @userId AND estado = N'completada') >= 3)
                OR (m.nombre = N'Constancia' AND u.minutos_totales >= 300)
                OR (m.nombre = N'Mil puntos' AND u.puntos_totales >= 1000)
                OR (m.nombre = N'Nivel 3' AND u.nivel >= 3)
              );
            """, connection, transaction);
        medalCommand.Parameters.AddWithValue("@userId", request.UserId);
        await medalCommand.ExecuteNonQueryAsync();

        await transaction.CommitAsync();
        return Results.Ok(new { minutes, points });
    }
    catch (SqlException exception) when (exception.Number == 50010)
    {
        await transaction.RollbackAsync();
        return Results.BadRequest(new { message = "No se pudo validar la cuenta para guardar el ejercicio." });
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}).RequireAuthorization();

app.MapPost("/api/auth/register", async (
    RegisterRequest request,
    IConfiguration configuration) =>
{
    var name = request.FullName?.Trim();
    var email = request.Email?.Trim().ToLowerInvariant();
    var password = request.Password ?? string.Empty;
    var domain = email?.Split('@').LastOrDefault();

    if (string.IsNullOrWhiteSpace(name) || name.Length > 120)
    {
        return Results.BadRequest(new { message = "Escribe un nombre válido." });
    }

    if (!IsValidEmail(email))
    {
        return Results.BadRequest(new { message = "Escribe un correo electrónico válido." });
    }

    if (string.IsNullOrWhiteSpace(domain))
    {
        return Results.BadRequest(new { message = "El correo debe incluir un dominio válido." });
    }

    if (password.Length < 8)
    {
        return Results.BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });
    }

    var passwordHash = HashPassword(password);

    try
    {
        await using var connection = new SqlConnection(
            configuration.GetConnectionString("EntrenaTuSer"));
        await connection.OpenAsync();

        await using var command = new SqlCommand(
            """
            INSERT INTO dbo.usuarios
                (nombre_completo, email, password_hash, email_verificado,
                 nivel, minutos_totales, puntos_totales, creado_en)
            VALUES
                (@name, @email, @passwordHash, 1, 1, 0, 0, SYSUTCDATETIME());
            SELECT CAST(SCOPE_IDENTITY() AS int);
            """, connection);
        command.Parameters.AddWithValue("@name", name);
        command.Parameters.AddWithValue("@email", email);
        command.Parameters.AddWithValue("@passwordHash", passwordHash);

        var userId = (int)(await command.ExecuteScalarAsync()
            ?? throw new InvalidOperationException("No se pudo crear el usuario."));

        return Results.Created($"/api/users/{userId}", new
        {
            id = userId,
            name,
            email,
            token = CreateJwtToken(userId, email!)
        });
    }
    catch (SqlException exception) when (exception.Number is 2601 or 2627)
    {
        return Results.Conflict(new { message = "Ya existe una cuenta con ese correo." });
    }
    catch (SqlException exception) when (exception.Number == 547)
    {
        return Results.BadRequest(new
        {
            message = "El dominio de tu correo no está permitido. Usa Gmail, Outlook, Hotmail, iCloud, Live o Yahoo."
        });
    }
});

// ==================== RUTINAS ====================

// GET /api/routines/user/{userId} - Listar rutinas del usuario
app.MapGet("/api/routines/user/{userId:int}", async (int userId, ClaimsPrincipal user, IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, userId);
    if (access is not null) return access;

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        """
        SELECT
            r.id,
            r.nombre,
            r.descripcion,
            r.creada_en,
            CAST(COUNT(re.ejercicio_id) AS int) AS ejercicio_count,
            COALESCE(SUM(e.duracion_seg * re.series), 0) AS total_duration_seconds
        FROM dbo.rutinas r
        LEFT JOIN dbo.rutina_ejercicios re ON re.rutina_id = r.id
        LEFT JOIN dbo.ejercicios e ON e.id = re.ejercicio_id
        WHERE r.usuario_id = @userId
        GROUP BY r.id, r.nombre, r.descripcion, r.creada_en
        ORDER BY r.creada_en DESC;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);

    await using var reader = await command.ExecuteReaderAsync();
    var routines = new List<object>();
    while (await reader.ReadAsync())
    {
        routines.Add(new
        {
            id = reader.GetInt32(0),
            name = reader.GetString(1),
            description = reader.IsDBNull(2) ? string.Empty : reader.GetString(2),
            createdAt = reader.GetDateTime(3).ToString("yyyy-MM-dd HH:mm"),
            exerciseCount = reader.GetInt32(4),
            totalDurationSeconds = reader.GetInt32(5)
        });
    }

    return Results.Ok(routines);
}).RequireAuthorization();

// GET /api/routines/{routineId} - Obtener rutina completa con ejercicios
app.MapGet("/api/routines/{routineId:int}", async (int routineId, ClaimsPrincipal user, IConfiguration configuration) =>
{
    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    // Datos de la rutina
    await using var cmd = new SqlCommand(
        "SELECT id, usuario_id, nombre, descripcion, creada_en FROM dbo.rutinas WHERE id = @id;", connection);
    cmd.Parameters.AddWithValue("@id", routineId);
    await using var reader = await cmd.ExecuteReaderAsync();
    if (!await reader.ReadAsync()) return Results.NotFound();

    var routine = new
    {
        id = reader.GetInt32(0),
        userId = reader.GetInt32(1),
        name = reader.GetString(2),
        description = reader.IsDBNull(3) ? string.Empty : reader.GetString(3),
        createdAt = reader.GetDateTime(4).ToString("yyyy-MM-dd HH:mm")
    };
    var access = CheckUserAccess(user, routine.userId);
    if (access is not null) return access;
    await reader.CloseAsync();

    // Ejercicios de la rutina
    await using var cmdEx = new SqlCommand(
        """
        SELECT re.ejercicio_id, e.nombre, e.descripcion, e.duracion_seg, re.orden, re.series, re.repeticiones, re.tiempo_descanso_seg
        FROM dbo.rutina_ejercicios re
        INNER JOIN dbo.ejercicios e ON e.id = re.ejercicio_id
        WHERE re.rutina_id = @routineId
        ORDER BY re.orden;
        """, connection);
    cmdEx.Parameters.AddWithValue("@routineId", routineId);
    await using var readerEx = await cmdEx.ExecuteReaderAsync();

    var exercises = new List<object>();
    while (await readerEx.ReadAsync())
    {
        exercises.Add(new
        {
            exerciseId = readerEx.GetInt32(0),
            name = readerEx.GetString(1),
            description = readerEx.GetString(2),
            durationSeconds = readerEx.GetInt32(3),
            order = readerEx.GetInt32(4),
            series = readerEx.GetInt32(5),
            reps = int.TryParse(readerEx.GetString(6), out var r) ? r : 0,
            restSeconds = readerEx.GetInt32(7)
        });
    }

    return Results.Ok(new { routine, exercises });
}).RequireAuthorization();

// POST /api/routines - Crear nueva rutina
app.MapPost("/api/routines", async (CreateRoutineRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    var access = CheckUserAccess(user, request.UserId);
    if (access is not null) return access;

    if (request.UserId <= 0 || string.IsNullOrWhiteSpace(request.Name))
        return Results.BadRequest(new { message = "Usuario y nombre de rutina son obligatorios." });

    if (request.ExerciseIds == null || request.ExerciseIds.Length == 0)
        return Results.BadRequest(new { message = "La rutina debe tener al menos un ejercicio." });

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

    try
    {
        // Verificar usuario existe
        await using var checkUser = new SqlCommand("SELECT 1 FROM dbo.usuarios WHERE id = @userId;", connection, transaction);
        checkUser.Parameters.AddWithValue("@userId", request.UserId);
        if (await checkUser.ExecuteScalarAsync() == null)
        {
            await transaction.RollbackAsync();
            return Results.NotFound(new { message = "Usuario no encontrado." });
        }

        // Crear rutina
        await using var cmdRoutine = new SqlCommand(
            """
            INSERT INTO dbo.rutinas (usuario_id, nombre, descripcion, creada_en)
            VALUES (@userId, @name, @desc, SYSUTCDATETIME());
            SELECT CAST(SCOPE_IDENTITY() AS int);
            """, connection, transaction);
        cmdRoutine.Parameters.AddWithValue("@userId", request.UserId);
        cmdRoutine.Parameters.AddWithValue("@name", request.Name.Trim());
        cmdRoutine.Parameters.AddWithValue("@desc", (object?)request.Description?.Trim() ?? DBNull.Value);

        var routineId = (int)(await cmdRoutine.ExecuteScalarAsync() ?? throw new InvalidOperationException("No se pudo crear la rutina."));

        // Insertar ejercicios
        for (int i = 0; i < request.ExerciseIds.Length; i++)
        {
            await using var cmdEx = new SqlCommand(
                """
                INSERT INTO dbo.rutina_ejercicios (rutina_id, ejercicio_id, orden, series, repeticiones, tiempo_descanso_seg)
                VALUES (@routineId, @exerciseId, @orden, @series, @reps, @rest);
                """, connection, transaction);
            cmdEx.Parameters.AddWithValue("@routineId", routineId);
            cmdEx.Parameters.AddWithValue("@exerciseId", request.ExerciseIds[i]);
            cmdEx.Parameters.AddWithValue("@orden", i + 1);
            cmdEx.Parameters.AddWithValue("@series", request.Series?.ElementAtOrDefault(i) ?? 3);
            cmdEx.Parameters.AddWithValue("@reps", request.Reps?.ElementAtOrDefault(i) ?? 10);
            cmdEx.Parameters.AddWithValue("@rest", request.RestSeconds?.ElementAtOrDefault(i) ?? 60);
            await cmdEx.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return Results.Created($"/api/routines/{routineId}", new { id = routineId, name = request.Name });
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}).RequireAuthorization();

// PUT /api/routines/{routineId} - Actualizar rutina
app.MapPut("/api/routines/{routineId:int}", async (int routineId, UpdateRoutineRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();
    await using var transaction = (SqlTransaction)await connection.BeginTransactionAsync();

    try
    {
        // Verificar rutina existe
        await using var check = new SqlCommand("SELECT usuario_id FROM dbo.rutinas WHERE id = @id;", connection, transaction);
        check.Parameters.AddWithValue("@id", routineId);
        var userIdObj = await check.ExecuteScalarAsync();
        if (userIdObj == null)
        {
            await transaction.RollbackAsync();
            return Results.NotFound(new { message = "Rutina no encontrada." });
        }
        var access = CheckUserAccess(user, Convert.ToInt32(userIdObj));
        if (access is not null)
        {
            await transaction.RollbackAsync();
            return access;
        }

        // Actualizar datos básicos
        await using var cmdUpd = new SqlCommand(
            "UPDATE dbo.rutinas SET nombre = @name, descripcion = @desc WHERE id = @id;", connection, transaction);
        cmdUpd.Parameters.AddWithValue("@id", routineId);
        cmdUpd.Parameters.AddWithValue("@name", request.Name.Trim());
        cmdUpd.Parameters.AddWithValue("@desc", (object?)request.Description?.Trim() ?? DBNull.Value);
        await cmdUpd.ExecuteNonQueryAsync();

        // Borrar ejercicios antiguos
        await using var cmdDel = new SqlCommand("DELETE FROM dbo.rutina_ejercicios WHERE rutina_id = @id;", connection, transaction);
        cmdDel.Parameters.AddWithValue("@id", routineId);
        await cmdDel.ExecuteNonQueryAsync();

        // Insertar nuevos ejercicios
        for (int i = 0; i < request.ExerciseIds.Length; i++)
        {
            await using var cmdEx = new SqlCommand(
                """
                INSERT INTO dbo.rutina_ejercicios (rutina_id, ejercicio_id, orden, series, repeticiones, tiempo_descanso_seg)
                VALUES (@routineId, @exerciseId, @orden, @series, @reps, @rest);
                """, connection, transaction);
            cmdEx.Parameters.AddWithValue("@routineId", routineId);
            cmdEx.Parameters.AddWithValue("@exerciseId", request.ExerciseIds[i]);
            cmdEx.Parameters.AddWithValue("@orden", i + 1);
            cmdEx.Parameters.AddWithValue("@series", request.Series?.ElementAtOrDefault(i) ?? 3);
            cmdEx.Parameters.AddWithValue("@reps", request.Reps?.ElementAtOrDefault(i) ?? 10);
            cmdEx.Parameters.AddWithValue("@rest", request.RestSeconds?.ElementAtOrDefault(i) ?? 60);
            await cmdEx.ExecuteNonQueryAsync();
        }

        await transaction.CommitAsync();
        return Results.Ok(new { id = routineId, name = request.Name });
    }
    catch
    {
        await transaction.RollbackAsync();
        throw;
    }
}).RequireAuthorization();

// DELETE /api/routines/{routineId} - Eliminar rutina
app.MapDelete("/api/routines/{routineId:int}", async (int routineId, ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var cmd = new SqlCommand("DELETE FROM dbo.rutinas WHERE id = @id AND usuario_id = @userId;", connection);
    cmd.Parameters.AddWithValue("@id", routineId);
    cmd.Parameters.AddWithValue("@userId", userId);
    var affected = await cmd.ExecuteNonQueryAsync();

    return affected > 0 ? Results.Ok(new { message = "Rutina eliminada." }) : Results.NotFound();
}).RequireAuthorization();

// ==================== PERFIL DE USUARIO ====================

// GET /api/user/profile - Obtener perfil completo con preferencias
app.MapGet("/api/user/profile", async (ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        """
        SELECT id, nombre_completo, email, nivel, minutos_totales, puntos_totales,
               tema, tamano_texto, alto_contraste, reducir_movimiento, escala_grises,
               avatar_color, avatar_iniciales, foto_url, creado_en, actualizado_en
        FROM dbo.usuarios WHERE id = @userId;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);

    await using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync()) return Results.NotFound(new { message = "Usuario no encontrado." });

    var profile = new
    {
        id = reader.GetInt32(0),
        fullName = reader.GetString(1),
        email = reader.GetString(2),
        level = reader.GetInt32(3),
        totalMinutes = reader.GetInt32(4),
        totalPoints = reader.GetInt32(5),
        preferences = new
        {
            theme = reader.GetString(6),
            fontSize = reader.GetString(7),
            highContrast = reader.GetBoolean(8),
            reducedMotion = reader.GetBoolean(9),
            grayscale = reader.GetBoolean(10)
        },
        avatar = new
        {
            color = reader.IsDBNull(11) ? null : reader.GetString(11),
            initials = reader.IsDBNull(12) ? null : reader.GetString(12),
            photoUrl = reader.IsDBNull(13) ? null : reader.GetString(13)
        },
        createdAt = reader.GetDateTime(14).ToString("yyyy-MM-dd HH:mm"),
        updatedAt = reader.GetDateTime(15).ToString("yyyy-MM-dd HH:mm")
    };

    return Results.Ok(profile);
}).RequireAuthorization();

// PUT /api/user/profile - Actualizar perfil (nombre, email, avatar)
app.MapPut("/api/user/profile", async (UpdateProfileRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    if (string.IsNullOrWhiteSpace(request.FullName) || request.FullName.Length > 120)
        return Results.BadRequest(new { message = "Nombre inválido (máx. 120 caracteres)." });

    if (!string.IsNullOrWhiteSpace(request.Email) && !IsValidEmail(request.Email))
        return Results.BadRequest(new { message = "Email inválido." });

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    // Verificar email único si se cambia
    if (!string.IsNullOrWhiteSpace(request.Email))
    {
        await using var checkEmail = new SqlCommand(
            "SELECT 1 FROM dbo.usuarios WHERE email = @email AND id != @userId;", connection);
        checkEmail.Parameters.AddWithValue("@email", request.Email.Trim().ToLowerInvariant());
        checkEmail.Parameters.AddWithValue("@userId", userId);
        if (await checkEmail.ExecuteScalarAsync() != null)
            return Results.BadRequest(new { message = "El email ya está en uso." });
    }

    await using var command = new SqlCommand(
        """
        UPDATE dbo.usuarios
        SET nombre_completo = @fullName,
            email = COALESCE(NULLIF(@email, ''), email),
            avatar_color = @avatarColor,
            avatar_iniciales = @avatarInitials,
            foto_url = @photoUrl,
            actualizado_en = SYSUTCDATETIME()
        WHERE id = @userId;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);
    command.Parameters.AddWithValue("@fullName", request.FullName.Trim());
    command.Parameters.AddWithValue("@email", (object?)request.Email?.Trim().ToLowerInvariant() ?? DBNull.Value);
    command.Parameters.AddWithValue("@avatarColor", (object?)request.AvatarColor ?? DBNull.Value);
    command.Parameters.AddWithValue("@avatarInitials", (object?)request.AvatarInitials ?? DBNull.Value);
    command.Parameters.AddWithValue("@photoUrl", (object?)request.PhotoUrl ?? DBNull.Value);

    var affected = await command.ExecuteNonQueryAsync();
    if (affected == 0) return Results.NotFound(new { message = "Usuario no encontrado." });

    return Results.Ok(new { message = "Perfil actualizado correctamente." });
}).RequireAuthorization();

// PUT /api/user/password - Cambiar contraseña
app.MapPut("/api/user/password", async (ChangePasswordRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        return Results.BadRequest(new { message = "Contraseña actual y nueva son obligatorias." });

    if (request.NewPassword.Length < 8)
        return Results.BadRequest(new { message = "La nueva contraseña debe tener al menos 8 caracteres." });

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        "SELECT password_hash FROM dbo.usuarios WHERE id = @userId;", connection);
    command.Parameters.AddWithValue("@userId", userId);

    var storedHash = (string?)await command.ExecuteScalarAsync();
    if (storedHash == null || !VerifyPassword(request.CurrentPassword, storedHash))
        return Results.BadRequest(new { message = "Contraseña actual incorrecta." });

    var newHash = HashPassword(request.NewPassword);
    await using var updateCmd = new SqlCommand(
        "UPDATE dbo.usuarios SET password_hash = @hash, actualizado_en = SYSUTCDATETIME() WHERE id = @userId;", connection);
    updateCmd.Parameters.AddWithValue("@hash", newHash);
    updateCmd.Parameters.AddWithValue("@userId", userId);
    await updateCmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = "Contraseña cambiada correctamente." });
}).RequireAuthorization();

// GET /api/user/preferences - Obtener preferencias de accesibilidad
app.MapGet("/api/user/preferences", async (ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        "SELECT tema, tamano_texto, alto_contraste, reducir_movimiento, escala_grises FROM dbo.usuarios WHERE id = @userId;", connection);
    command.Parameters.AddWithValue("@userId", userId);

    await using var reader = await command.ExecuteReaderAsync();
    if (!await reader.ReadAsync()) return Results.NotFound();

    var prefs = new
    {
        theme = reader.GetString(0),
        fontSize = reader.GetString(1),
        highContrast = reader.GetBoolean(2),
        reducedMotion = reader.GetBoolean(3),
        grayscale = reader.GetBoolean(4)
    };

    return Results.Ok(prefs);
}).RequireAuthorization();

// PUT /api/user/preferences - Actualizar preferencias de accesibilidad
app.MapPut("/api/user/preferences", async (UpdatePreferencesRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        """
        UPDATE dbo.usuarios
        SET tema = @theme,
            tamano_texto = @fontSize,
            alto_contraste = @highContrast,
            reducir_movimiento = @reducedMotion,
            escala_grises = @grayscale,
            actualizado_en = SYSUTCDATETIME()
        WHERE id = @userId;
        """, connection);
    command.Parameters.AddWithValue("@userId", userId);
    command.Parameters.AddWithValue("@theme", request.Theme ?? "light");
    command.Parameters.AddWithValue("@fontSize", request.FontSize ?? "normal");
    command.Parameters.AddWithValue("@highContrast", request.HighContrast ?? false);
    command.Parameters.AddWithValue("@reducedMotion", request.ReducedMotion ?? false);
    command.Parameters.AddWithValue("@grayscale", request.Grayscale ?? false);

    var affected = await command.ExecuteNonQueryAsync();
    if (affected == 0) return Results.NotFound();

    return Results.Ok(new { message = "Preferencias actualizadas." });
}).RequireAuthorization();

// POST /api/user/delete - Eliminar cuenta
app.MapPost("/api/user/delete", async (DeleteAccountRequest request, ClaimsPrincipal user, IConfiguration configuration) =>
{
    if (!user.Identity?.IsAuthenticated ?? true) return Results.Unauthorized();
    if (!TryGetTokenUserId(user, out var userId)) return Results.Forbid();

    if (string.IsNullOrWhiteSpace(request.Password))
        return Results.BadRequest(new { message = "Contraseña requerida para confirmar." });

    await using var connection = new SqlConnection(configuration.GetConnectionString("EntrenaTuSer"));
    await connection.OpenAsync();

    await using var command = new SqlCommand(
        "SELECT password_hash FROM dbo.usuarios WHERE id = @userId;", connection);
    command.Parameters.AddWithValue("@userId", userId);

    var storedHash = (string?)await command.ExecuteScalarAsync();
    if (storedHash == null || !VerifyPassword(request.Password, storedHash))
        return Results.BadRequest(new { message = "Contraseña incorrecta." });

    // Eliminar usuario (CASCADE borra datos relacionados)
    await using var deleteCmd = new SqlCommand("DELETE FROM dbo.usuarios WHERE id = @userId;", connection);
    deleteCmd.Parameters.AddWithValue("@userId", userId);
    await deleteCmd.ExecuteNonQueryAsync();

    return Results.Ok(new { message = "Cuenta eliminada permanentemente." });
}).RequireAuthorization();

// ==================== RUTINAS ====================

app.Run();

static bool IsValidEmail(string? email)
{
    if (string.IsNullOrWhiteSpace(email) || email.Length > 254) return false;
    try
    {
        return new System.Net.Mail.MailAddress(email).Address == email;
    }
    catch (FormatException)
    {
        return false;
    }
}

static bool OwnsUser(ClaimsPrincipal user, int userId)
{
    return TryGetTokenUserId(user, out var tokenUserId) && tokenUserId == userId;
}

static IResult? CheckUserAccess(ClaimsPrincipal user, int userId)
{
    if (!(user.Identity?.IsAuthenticated ?? false)) return Results.Unauthorized();
    return OwnsUser(user, userId) ? null : Results.Forbid();
}

static bool TryGetTokenUserId(ClaimsPrincipal user, out int userId)
{
    var claim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    return int.TryParse(claim, out userId);
}

static string HashPassword(string password)
{
    const int saltSize = 16;
    const int hashSize = 32;
    const int iterations = 100_000;
    var salt = RandomNumberGenerator.GetBytes(saltSize);
    var hash = Rfc2898DeriveBytes.Pbkdf2(
        password,
        salt,
        iterations,
        HashAlgorithmName.SHA256,
        hashSize);

    return $"PBKDF2-SHA256.{iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
}

static bool VerifyPassword(string password, string storedHash)
{
    var parts = storedHash.Split('.');
    if (parts.Length != 4 || parts[0] != "PBKDF2-SHA256"
        || !int.TryParse(parts[1], out var iterations)) return false;

    var salt = Convert.FromBase64String(parts[2]);
    var expected = Convert.FromBase64String(parts[3]);
    var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations,
        HashAlgorithmName.SHA256, expected.Length);
    return CryptographicOperations.FixedTimeEquals(actual, expected);
}

record LoginRequest(string? Email, string? Password);
record SaveGoalRequest(int UserId, string Type, int Target);
record CompleteExerciseRequest(int UserId, int ExerciseId, int DurationSeconds, int? RoutineId);
record RegisterRequest(string? FullName, string? Email, string? Password);
record CreateRoutineRequest(int UserId, string Name, string? Description, int[] ExerciseIds, int[] Series, int[] Reps, int[] RestSeconds);
record UpdateRoutineRequest(string Name, string? Description, int[] ExerciseIds, int[] Series, int[] Reps, int[] RestSeconds);

// Profile records
record UpdateProfileRequest(string FullName, string? Email, string? AvatarColor, string? AvatarInitials, string? PhotoUrl);
record ChangePasswordRequest(string CurrentPassword, string NewPassword);
record UpdatePreferencesRequest(string? Theme, string? FontSize, bool? HighContrast, bool? ReducedMotion, bool? Grayscale);
record DeleteAccountRequest(string Password);
