#!/usr/bin/env dotnet-script
// Entrena Tu Ser - Database Migration Runner
// Usage: dotnet-script migrate.csx [--connection-string "..."] [--migrations-path "..."]

#r "nuget: Microsoft.Data.SqlClient, 5.2.0"
#r "nuget: Microsoft.Extensions.Configuration, 8.0.0"
#r "nuget: Microsoft.Extensions.Configuration.Json, 8.0.0"
#r "nuget: Microsoft.Extensions.Configuration.EnvironmentVariables, 8.0.0"

using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

var argsList = Args.ToList();
string connectionString = null;
string migrationsPath = Path.Combine(Directory.GetCurrentDirectory(), "migrations");

for (int i = 0; i < argsList.Count; i++)
{
    if (argsList[i] == "--connection-string" && i + 1 < argsList.Count)
    {
        connectionString = argsList[i + 1];
        i++;
    }
    else if (argsList[i] == "--migrations-path" && i + 1 < argsList.Count)
    {
        migrationsPath = argsList[i + 1];
        i++;
    }
}

// Load from appsettings.json if not provided
if (string.IsNullOrEmpty(connectionString))
{
    var config = new ConfigurationBuilder()
        .SetBasePath(Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true)
        .AddJsonFile("appsettings.Development.json", optional: true)
        .AddEnvironmentVariables()
        .Build();

    connectionString = config.GetConnectionString("EntrenaTuSer");
}

if (string.IsNullOrEmpty(connectionString))
{
    Console.Error.WriteLine("ERROR: No connection string provided. Use --connection-string or set in appsettings.json");
    Environment.Exit(1);
}

Console.WriteLine($"Using migrations path: {migrationsPath}");
Console.WriteLine($"Connection string: {connectionString.Split(';')[0]}...");

var masterConnection = new SqlConnection(connectionString);
await masterConnection.OpenAsync();

// Ensure database exists
var dbName = new SqlConnectionStringBuilder(connectionString).InitialCatalog;
using (var checkCmd = new SqlCommand($"SELECT database_id FROM sys.databases WHERE name = '{dbName}'", masterConnection))
{
    var result = await checkCmd.ExecuteScalarAsync();
    if (result == null)
    {
        Console.WriteLine($"Database '{dbName}' does not exist. Creating...");
        using var createCmd = new SqlCommand($"CREATE DATABASE [{dbName}]", masterConnection);
        await createCmd.ExecuteNonQueryAsync();
        Console.WriteLine("Database created.");
    }
}

masterConnection.Close();
masterConnection.Dispose();

// Connect to target database
var builder = new SqlConnectionStringBuilder(connectionString);
var connection = new SqlConnection(builder.ConnectionString);
await connection.OpenAsync();

// Create migration history table
using (var cmd = new SqlCommand(@"
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = '__migrations_history')
    BEGIN
        CREATE TABLE __migrations_history (
            id INT IDENTITY(1,1) PRIMARY KEY,
            migration_name NVARCHAR(256) NOT NULL,
            applied_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
            checksum NVARCHAR(64) NULL
        );
    END", connection))
{
    await cmd.ExecuteNonQueryAsync();
}

// Get applied migrations
var appliedMigrations = new System.Collections.Generic.HashSet<string>(StringComparer.OrdinalIgnoreCase);
using (var cmd = new SqlCommand("SELECT migration_name FROM __migrations_history", connection))
using (var reader = await cmd.ExecuteReaderAsync())
{
    while (await reader.ReadAsync())
    {
        appliedMigrations.Add(reader.GetString(0));
    }
}

// Get migration files
var migrationFiles = Directory.GetFiles(migrationsPath, "*.sql")
    .OrderBy(f => Path.GetFileName(f))
    .ToArray();

Console.WriteLine($"\nFound {migrationFiles.Length} migration file(s):");
foreach (var f in migrationFiles)
    Console.WriteLine($"  - {Path.GetFileName(f)}");

int appliedCount = 0;
foreach (var file in migrationFiles)
{
    var name = Path.GetFileName(file);
    if (appliedMigrations.Contains(name))
    {
        Console.WriteLine($"  [SKIP] {name} (already applied)");
        continue;
    }

    Console.WriteLine($"  [APPLY] {name}...");
    var sql = await File.ReadAllTextAsync(file);
    
    // Split by GO batches
    var batches = sql.Split(new[] { "\nGO\n", "\nGO\r\n" }, StringSplitOptions.RemoveEmptyEntries);
    
    foreach (var batch in batches)
    {
        var trimmed = batch.Trim();
        if (string.IsNullOrWhiteSpace(trimmed)) continue;
        
        using var cmd = new SqlCommand(trimmed, connection);
        await cmd.ExecuteNonQueryAsync();
    }

    // Record migration
    using (var cmd = new SqlCommand(
        "INSERT INTO __migrations_history (migration_name) VALUES (@name)", connection))
    {
        cmd.Parameters.AddWithValue("@name", name);
        await cmd.ExecuteNonQueryAsync();
    }

    appliedCount++;
    Console.WriteLine($"  [DONE] {name}");
}

connection.Close();
connection.Dispose();

Console.WriteLine($"\n✅ Migration complete. {appliedCount} new migration(s) applied.");