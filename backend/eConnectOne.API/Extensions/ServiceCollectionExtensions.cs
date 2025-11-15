using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace eConnectOne.API.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddLogging(this IServiceCollection services)
        {
            services.AddLogging(builder =>
            {
                builder.AddConsole();
                builder.AddDebug();
                builder.SetMinimumLevel(LogLevel.Information);
            });
            
            return services;
        }
    }
}