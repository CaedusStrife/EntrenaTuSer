USE EntrenaTuSer;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.medallas WHERE nombre = N'Primer paso')
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion)
    VALUES (N'Primer paso', N'Completaste tu primer ejercicio');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.medallas WHERE nombre = N'Trío activo')
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion)
    VALUES (N'Trío activo', N'Completaste 3 ejercicios');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.medallas WHERE nombre = N'Constancia')
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion)
    VALUES (N'Constancia', N'Acumulas 300 minutos de actividad');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.medallas WHERE nombre = N'Mil puntos')
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion)
    VALUES (N'Mil puntos', N'Acumulas 1000 puntos');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.medallas WHERE nombre = N'Nivel 3')
BEGIN
    INSERT INTO dbo.medallas (nombre, descripcion)
    VALUES (N'Nivel 3', N'Alcanzaste el nivel 3');
END
GO
