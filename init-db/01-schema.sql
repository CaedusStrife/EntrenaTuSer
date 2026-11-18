-- Esta carpeta se monta en /docker-entrypoint-initdb.d del contenedor
-- Los .sql aquí corren automáticamente la PRIMERA vez que se crea el volumen

IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'EntrenaTuSer')
BEGIN
    CREATE DATABASE EntrenaTuSer;
END
GO

USE EntrenaTuSer;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuarios')
BEGIN
    CREATE TABLE dbo.usuarios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre_completo NVARCHAR(120) NOT NULL,
        email NVARCHAR(254) NOT NULL UNIQUE,
        password_hash NVARCHAR(MAX) NOT NULL,
        email_verificado BIT NOT NULL DEFAULT 1,
        nivel INT NOT NULL DEFAULT 1,
        minutos_totales INT NOT NULL DEFAULT 0,
        puntos_totales INT NOT NULL DEFAULT 0,
        creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'metas_usuario')
BEGIN
    CREATE TABLE dbo.metas_usuario (
        usuario_id INT PRIMARY KEY FOREIGN KEY REFERENCES dbo.usuarios(id),
        tipo NVARCHAR(20) NOT NULL CHECK (tipo IN (N'minutes', N'exercises')),
        objetivo INT NOT NULL CHECK (objetivo > 0),
        semana_inicio DATE NOT NULL,
        actualizado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ejercicios')
BEGIN
    CREATE TABLE dbo.ejercicios (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(MAX) NOT NULL,
        duracion_seg INT NOT NULL,
        video_url NVARCHAR(500) NULL
    );

    INSERT INTO dbo.ejercicios (nombre, descripcion, duracion_seg, video_url) VALUES
    ('Rotaciones de cuello', 'Movimientos suaves de lado a lado', 60, NULL),
    ('Elevación de hombros', 'Sube y baja los hombros', 60, NULL),
    ('Círculos de brazos', 'Brazos extendidos, círculos hacia adelante y atrás', 90, NULL),
    ('Sentadillas', 'Flexiona rodillas manteniendo espalda recta', 120, '/videos/1- Sentadilla basica.mp4'),
    ('Flexiones de pared', 'Apoya manos en pared y flexiona codos', 120, '/videos/5- flexiones en pared.mp4'),
    ('Plancha abdominal', 'Mantén posición recta contra el suelo', 60, NULL),
    ('Estiramiento de cuádriceps', 'Tira del talón hacia glúteo', 60, NULL),
    ('Extensión de cadera', 'Lleva pierna hacia atrás de pie', 60, '/videos/7- Extension de cadera de pie.mp4'),
    ('Elevación de talones', 'Ponte de puntitas y baja', 60, '/videos/8- Elevacion de talones.mp4');
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'medallas')
BEGIN
    CREATE TABLE dbo.medallas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(MAX) NULL
    );
    INSERT INTO dbo.medallas (nombre, descripcion) VALUES
    ('Primer paso', 'Completaste tu primer ejercicio'),
    ('Trío activo', 'Completaste 3 ejercicios'),
    ('Constancia', 'Acumulas 300 minutos de actividad'),
    ('Mil puntos', 'Acumulas 1000 puntos'),
    ('Nivel 3', 'Alcanzaste el nivel 3');
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sesiones_entrenamiento')
BEGIN
    CREATE TABLE dbo.sesiones_entrenamiento (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        usuario_id INT NOT NULL FOREIGN KEY REFERENCES dbo.usuarios(id),
        rutina_id INT NOT NULL DEFAULT 1,
        inicio DATETIME2 NOT NULL,
        fin DATETIME2 NOT NULL,
        minutos INT NOT NULL,
        puntos INT NOT NULL,
        porcentaje_avance INT NOT NULL,
        estado NVARCHAR(20) NOT NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sesion_ejercicios')
BEGIN
    CREATE TABLE dbo.sesion_ejercicios (
        sesion_id BIGINT NOT NULL FOREIGN KEY REFERENCES dbo.sesiones_entrenamiento(id),
        ejercicio_id INT NOT NULL FOREIGN KEY REFERENCES dbo.ejercicios(id),
        porcentaje_precision INT NOT NULL,
        puntos INT NOT NULL,
        completado BIT NOT NULL,
        PRIMARY KEY (sesion_id, ejercicio_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'usuario_medallas')
BEGIN
    CREATE TABLE dbo.usuario_medallas (
        usuario_id INT NOT NULL FOREIGN KEY REFERENCES dbo.usuarios(id),
        medalla_id INT NOT NULL FOREIGN KEY REFERENCES dbo.medallas(id),
        obtenida_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        PRIMARY KEY (usuario_id, medalla_id)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rutinas')
BEGIN
    CREATE TABLE dbo.rutinas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        descripcion NVARCHAR(MAX) NULL
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'rutina_ejercicios')
BEGIN
    CREATE TABLE dbo.rutina_ejercicios (
        rutina_id INT NOT NULL FOREIGN KEY REFERENCES dbo.rutinas(id),
        ejercicio_id INT NOT NULL FOREIGN KEY REFERENCES dbo.ejercicios(id),
        orden INT NOT NULL,
        series INT NOT NULL DEFAULT 3,
        repeticiones INT NOT NULL DEFAULT 10,
        PRIMARY KEY (rutina_id, ejercicio_id)
    );
END
GO