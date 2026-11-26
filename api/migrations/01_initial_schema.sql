-- ============================================================================
-- Entrena Tu Ser - Initial Database Schema (Idempotent)
-- Migration 01: Core tables
-- ============================================================================

-- USUARIOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre_completo NVARCHAR(120) NOT NULL,
        email NVARCHAR(256) NOT NULL UNIQUE,
        password_hash NVARCHAR(512) NOT NULL,
        email_verificado BIT NOT NULL DEFAULT 0,
        nivel INT NOT NULL DEFAULT 1,
        minutos_totales INT NOT NULL DEFAULT 0,
        puntos_totales INT NOT NULL DEFAULT 0,
        creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        -- Preferencias de accesibilidad (Fase 2)
        tema NVARCHAR(20) NOT NULL DEFAULT 'light',
        tamano_texto NVARCHAR(20) NOT NULL DEFAULT 'normal',
        alto_contraste BIT NOT NULL DEFAULT 0,
        reducir_movimiento BIT NOT NULL DEFAULT 0,
        escala_grises BIT NOT NULL DEFAULT 0,
        -- Avatar / foto
        avatar_color NVARCHAR(7) NULL,
        avatar_iniciales NVARCHAR(10) NULL,
        foto_url NVARCHAR(500) NULL
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'tema')
        ALTER TABLE dbo.usuarios ADD tema NVARCHAR(20) NOT NULL DEFAULT 'light';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'tamano_texto')
        ALTER TABLE dbo.usuarios ADD tamano_texto NVARCHAR(20) NOT NULL DEFAULT 'normal';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'alto_contraste')
        ALTER TABLE dbo.usuarios ADD alto_contraste BIT NOT NULL DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'reducir_movimiento')
        ALTER TABLE dbo.usuarios ADD reducir_movimiento BIT NOT NULL DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'escala_grises')
        ALTER TABLE dbo.usuarios ADD escala_grises BIT NOT NULL DEFAULT 0;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'avatar_color')
        ALTER TABLE dbo.usuarios ADD avatar_color NVARCHAR(7) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'avatar_iniciales')
        ALTER TABLE dbo.usuarios ADD avatar_iniciales NVARCHAR(10) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'foto_url')
        ALTER TABLE dbo.usuarios ADD foto_url NVARCHAR(500) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.usuarios') AND name = 'actualizado_en')
        ALTER TABLE dbo.usuarios ADD actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME();
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuarios_email' AND object_id = OBJECT_ID('dbo.usuarios'))
    CREATE INDEX IX_usuarios_email ON dbo.usuarios(email);
GO

-- EJERCICIOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ejercicios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.ejercicios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(120) NOT NULL,
        descripcion NVARCHAR(MAX) NULL,
        duracion_seg INT NOT NULL DEFAULT 60,
        video_url NVARCHAR(500) NULL,
        categoria NVARCHAR(50) NULL,
        grupo_muscular NVARCHAR(50) NULL,
        dificultad NVARCHAR(20) NULL DEFAULT 'principiante'
    );
END
GO

-- RUTINAS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rutinas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.rutinas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        nombre NVARCHAR(120) NOT NULL,
        descripcion NVARCHAR(MAX) NULL,
        creada_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        actualizada_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_rutinas_usuario_id' AND object_id = OBJECT_ID('dbo.rutinas'))
    CREATE INDEX IX_rutinas_usuario_id ON dbo.rutinas(usuario_id);
GO

-- RUTINA_EJERCICIOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rutina_ejercicios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.rutina_ejercicios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        rutina_id INT NOT NULL REFERENCES dbo.rutinas(id) ON DELETE CASCADE,
        ejercicio_id INT NOT NULL REFERENCES dbo.ejercicios(id),
        orden INT NOT NULL,
        series INT NOT NULL DEFAULT 3,
        repeticiones NVARCHAR(20) NOT NULL DEFAULT '10',
        tiempo_descanso_seg INT NOT NULL DEFAULT 60
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_rutina_ejercicios_rutina_id' AND object_id = OBJECT_ID('dbo.rutina_ejercicios'))
    CREATE INDEX IX_rutina_ejercicios_rutina_id ON dbo.rutina_ejercicios(rutina_id);
GO

-- SESIONES_ENTRENAMIENTO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sesiones_entrenamiento' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.sesiones_entrenamiento (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        rutina_id INT NULL REFERENCES dbo.rutinas(id),
        inicio DATETIME2 NOT NULL,
        fin DATETIME2 NULL,
        minutos INT NOT NULL DEFAULT 0,
        puntos INT NOT NULL DEFAULT 0,
        porcentaje_avance INT NOT NULL DEFAULT 0,
        estado NVARCHAR(20) NOT NULL DEFAULT 'iniciada' CHECK (estado IN ('iniciada', 'completada', 'cancelada'))
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sesiones_usuario_id' AND object_id = OBJECT_ID('dbo.sesiones_entrenamiento'))
    CREATE INDEX IX_sesiones_usuario_id ON dbo.sesiones_entrenamiento(usuario_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sesiones_rutina_id' AND object_id = OBJECT_ID('dbo.sesiones_entrenamiento'))
    CREATE INDEX IX_sesiones_rutina_id ON dbo.sesiones_entrenamiento(rutina_id);
IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_sesiones_estado' AND object_id = OBJECT_ID('dbo.sesiones_entrenamiento'))
    CREATE INDEX IX_sesiones_estado ON dbo.sesiones_entrenamiento(estado);
GO

-- SESION_EJERCICIOS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sesion_ejercicios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.sesion_ejercicios (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        sesion_id BIGINT NOT NULL REFERENCES dbo.sesiones_entrenamiento(id) ON DELETE CASCADE,
        ejercicio_id INT NOT NULL REFERENCES dbo.ejercicios(id),
        porcentaje_precision INT NOT NULL DEFAULT 100,
        puntos INT NOT NULL DEFAULT 0,
        completado BIT NOT NULL DEFAULT 1
    );
END
GO

-- PROGRESO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'progreso' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.progreso (
        usuario_id INT PRIMARY KEY REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        minutos_totales INT NOT NULL DEFAULT 0,
        puntos_totales INT NOT NULL DEFAULT 0,
        nivel INT NOT NULL DEFAULT 1,
        ejercicios_completados INT NOT NULL DEFAULT 0,
        actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

-- METAS_USUARIO
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'metas_usuario' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.metas_usuario (
        id INT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        tipo NVARCHAR(20) NOT NULL CHECK (tipo IN ('minutos', 'ejercicios')),
        objetivo INT NOT NULL,
        semana_inicio DATE NOT NULL,
        creada_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_metas_usuario_id' AND object_id = OBJECT_ID('dbo.metas_usuario'))
    CREATE INDEX IX_metas_usuario_id ON dbo.metas_usuario(usuario_id);
GO

-- MEDALLAS (catálogo)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'medallas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.medallas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(50) NOT NULL UNIQUE,
        descripcion NVARCHAR(200) NULL,
        icono NVARCHAR(50) NULL,
        condicion_tipo NVARCHAR(50) NOT NULL,
        condicion_valor INT NULL
    );
END
ELSE
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'icono')
        ALTER TABLE dbo.medallas ADD icono NVARCHAR(50) NULL;
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'condicion_tipo')
        ALTER TABLE dbo.medallas ADD condicion_tipo NVARCHAR(50) NOT NULL DEFAULT 'first_session';
    IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'condicion_valor')
        ALTER TABLE dbo.medallas ADD condicion_valor INT NULL;
END
GO

-- USUARIO_MEDALLAS
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario_medallas' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.usuario_medallas (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        medalla_id INT NOT NULL REFERENCES dbo.medallas(id),
        obtenida_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        UNIQUE (usuario_id, medalla_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_usuario_medallas_usuario_id' AND object_id = OBJECT_ID('dbo.usuario_medallas'))
    CREATE INDEX IX_usuario_medallas_usuario_id ON dbo.usuario_medallas(usuario_id);
GO

-- COMENTARIOS (social)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'comentarios' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.comentarios (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
        ejercicio_id INT NOT NULL REFERENCES dbo.ejercicios(id),
        contenido NVARCHAR(MAX) NOT NULL,
        creada_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_comentarios_ejercicio_id' AND object_id = OBJECT_ID('dbo.comentarios'))
    CREATE INDEX IX_comentarios_ejercicio_id ON dbo.comentarios(ejercicio_id);
GO

-- Seed medallas (only if table is empty) - separate batch after all DDL
IF NOT EXISTS (SELECT 1 FROM dbo.medallas)
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion, icono, condicion_tipo, condicion_valor) VALUES
    (N'Primer paso', N'Completa tu primer entrenamiento', 'award', 'first_session', 1),
    (N'Trío activo', N'Entrena 3 días seguidos', 'flame', 'streak_3', 3),
    (N'Constancia', N'Entrena 7 días seguidos', 'zap', 'streak_7', 7),
    (N'Mil puntos', N'Acumula 1000 puntos', 'star', 'points_1000', 1000),
    (N'Nivel 3', N'Alcanza el nivel 3', 'trending-up', 'level_3', 3),
    (N'Rutina completa', N'Completa una rutina personalizada', 'check-circle', 'routine_complete', 1),
    (N'Meta alcanzada', N'Cumple una meta semanal', 'target', 'goal_reached', 1);
END