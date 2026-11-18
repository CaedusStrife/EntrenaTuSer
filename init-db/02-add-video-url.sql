-- Migración para agregar columna video_url a la tabla ejercicios
-- Ejecutar en la base de datos EntrenaTuSer existente

USE EntrenaTuSer;
GO

-- Agregar columna video_url si no existe
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.ejercicios') AND name = 'video_url')
BEGIN
    ALTER TABLE dbo.ejercicios ADD video_url NVARCHAR(500) NULL;
END
GO

-- Actualizar ejercicios con URLs de video
UPDATE dbo.ejercicios SET video_url = '/videos/1- Sentadilla basica.mp4' WHERE nombre = 'Sentadillas';
UPDATE dbo.ejercicios SET video_url = '/videos/5- flexiones en pared.mp4' WHERE nombre = 'Flexiones de pared';
UPDATE dbo.ejercicios SET video_url = '/videos/7- Extension de cadera de pie.mp4' WHERE nombre = 'Extensión de cadera';
UPDATE dbo.ejercicios SET video_url = '/videos/8- Elevacion de talones.mp4' WHERE nombre = 'Elevación de talones';
GO

-- Verificar
SELECT id, nombre, video_url FROM dbo.ejercicios ORDER BY id;