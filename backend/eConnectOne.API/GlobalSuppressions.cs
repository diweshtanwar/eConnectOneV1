using System.Diagnostics.CodeAnalysis;

// Suppress nullable reference warnings for model properties that are initialized by EF Core
[assembly: SuppressMessage("Compiler", "CS8618:Non-nullable property must contain a non-null value when exiting constructor", Justification = "Properties are initialized by Entity Framework")]

// Suppress unused variable warnings in catch blocks
[assembly: SuppressMessage("Style", "CS0168:The variable is declared but never used", Justification = "Exception variables in catch blocks for future logging")]

// Suppress possible null reference warnings for configuration values
[assembly: SuppressMessage("Compiler", "CS8604:Possible null reference argument", Justification = "Configuration values are validated at startup")]