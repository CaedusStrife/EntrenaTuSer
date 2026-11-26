-- ============================================================================
-- Entrena Tu Ser - Add Missing Columns to Existing Tables
-- Migration 03: Fix production schema drift
-- ============================================================================

-- USUARIOS: Add missing columns (may already exist from partial migration)
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

-- MEDALLAS: Add missing columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'icono')
    ALTER TABLE dbo.medallas ADD icono NVARCHAR(50) NULL;

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'condicion_tipo')
    ALTER TABLE dbo.medallas ADD condicion_tipo NVARCHAR(50) NOT NULL DEFAULT 'first_session';

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('dbo.medallas') AND name = 'condicion_valor')
    ALTER TABLE dbo.medallas ADD condicion_valor INT NULL;

-- Seed medallas data if table is empty
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