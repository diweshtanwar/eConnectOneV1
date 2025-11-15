using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace eConnectOne.API.Attributes
{
    public class ValidateAntiForgeryTokenAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext context)
        {
            var contentType = context.HttpContext.Request.ContentType;
            
            if (string.IsNullOrEmpty(contentType) || 
                (!contentType.StartsWith("application/json") && 
                 !contentType.StartsWith("multipart/form-data")))
            {
                context.Result = new BadRequestObjectResult("Invalid content type");
                return;
            }
            
            base.OnActionExecuting(context);
        }
    }
}