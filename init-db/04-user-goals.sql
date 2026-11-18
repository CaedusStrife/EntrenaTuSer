USE EntrenaTuSer;
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
