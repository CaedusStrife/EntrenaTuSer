#r "nuget: Microsoft.Data.SqlClient, 5.2.0"
#r "nuget: Microsoft.Extensions.Configuration, 8.0.0"
#r "nuget: Microsoft.Extensions.Configuration.Json, 8.0.0"

using System;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

var config = new ConfigurationBuilder()
    .SetBasePath(Directory.GetCurrentDirectory())
    .AddJsonFile("appsettings.json", optional: true)
    .Build();

var cs = config.GetConnectionString("EntrenaTuSer");

var conn = new SqlConnection(cs);
await conn.OpenAsync();

var migrations = new[] {
    "01_initial_schema.sql",
    "02_password_reset_tokens.sql"
};

foreach (var m in migrations) {
    var cmd = new SqlCommand("INSERT INTO __migrations_history (migration_name) VALUES (@name)", conn);
    cmd.Parameters.AddWithValue("@name", m);
    await cmd.ExecuteNonQueryAsync();
    cmd.Dispose();
    Console.WriteLine($"Recorded: {m}");
}

conn.Close();
conn.Dispose();
Console.WriteLine("Done.");