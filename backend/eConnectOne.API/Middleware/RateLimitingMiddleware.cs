using System.Collections.Concurrent;
using System.Net;

namespace eConnectOne.API.Middleware
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly ConcurrentDictionary<string, UserRateLimit> _clients = new();
        private readonly int _requestsPerMinute;
        private readonly int _requestsPerHour;

        public RateLimitingMiddleware(RequestDelegate next, int requestsPerMinute = 60, int requestsPerHour = 1000)
        {
            _next = next;
            _requestsPerMinute = requestsPerMinute;
            _requestsPerHour = requestsPerHour;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var clientId = GetClientId(context);
            var userLimit = _clients.GetOrAdd(clientId, _ => new UserRateLimit());

            if (!userLimit.CanMakeRequest(_requestsPerMinute, _requestsPerHour))
            {
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                await context.Response.WriteAsync("Rate limit exceeded");
                return;
            }

            await _next(context);
        }

        private string GetClientId(HttpContext context)
        {
            var userId = context.User?.FindFirst("id")?.Value;
            var ip = context.Connection.RemoteIpAddress?.ToString();
            return userId ?? ip ?? "anonymous";
        }
    }

    public class UserRateLimit
    {
        private readonly Queue<DateTime> _requests = new();
        private readonly object _lock = new();

        public bool CanMakeRequest(int perMinute, int perHour)
        {
            lock (_lock)
            {
                var now = DateTime.UtcNow;
                
                // Remove old requests
                while (_requests.Count > 0 && _requests.Peek() < now.AddHours(-1))
                    _requests.Dequeue();

                var recentRequests = _requests.Where(r => r > now.AddMinutes(-1)).Count();
                
                if (recentRequests >= perMinute || _requests.Count >= perHour)
                    return false;

                _requests.Enqueue(now);
                return true;
            }
        }
    }
}