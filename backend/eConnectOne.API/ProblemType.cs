using System;
using System.Collections.Generic;

namespace eConnectOne.API;

public partial class ProblemType
{
    public int ProblemTypeId { get; set; }

    public string ProblemTypeName { get; set; } = null!;

    public string? Description { get; set; }
}
