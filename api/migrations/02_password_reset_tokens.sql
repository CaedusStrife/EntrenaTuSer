-- ============================================================================
-- Entrena Tu Ser - Password Reset Tokens
-- Migration 02: Password reset token table
-- ============================================================================

-- PASSWORD RESET TOKENS
CREATE TABLE dbo.password_reset_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    usuario_id INT NOT NULL REFERENCES dbo.usuarios(id) ON DELETE CASCADE,
    token_hash NVARCHAR(512) NOT NULL,
    expira_en DATETIME2 NOT NULL,
    usado BIT NOT NULL DEFAULT 0,
    creado_en DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_password_reset_tokens_usuario ON dbo.password_reset_tokens(usuario_id);
CREATE INDEX IX_password_reset_tokens_expira ON dbo.password_reset_tokens(expira_en);

-- Cleanup old tokens periodically (optional: can be run as scheduled job)
-- DELETE FROM dbo.password_reset_tokens WHERE expira_en < SYSUTCDATETIME();