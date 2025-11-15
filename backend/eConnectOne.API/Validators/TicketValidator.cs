using eConnectOne.API.DTOs.Tickets;

namespace eConnectOne.API.Validators
{
    public static class TicketValidator
    {
        public static bool ValidateCreateDto(TicketCreateDto dto, out string error)
        {
            error = string.Empty;

            if (dto.TypeId <= 0)
            {
                error = "TypeId must be greater than 0";
                return false;
            }

            if (string.IsNullOrWhiteSpace(dto.Summary))
            {
                error = "Summary is required";
                return false;
            }

            if (dto.Summary.Length > 255)
            {
                error = "Summary cannot exceed 255 characters";
                return false;
            }

            if (dto.StatusId <= 0)
            {
                error = "StatusId must be greater than 0";
                return false;
            }

            if (!string.IsNullOrEmpty(dto.RequesterEmail) && !IsValidEmail(dto.RequesterEmail))
            {
                error = "Invalid email format";
                return false;
            }

            if (dto.TypeId == 2 && dto.WithdrawalDetail?.Amount <= 0)
            {
                error = "Withdrawal amount must be greater than 0";
                return false;
            }

            if (dto.TypeId == 3 && dto.DepositDetail?.Amount <= 0)
            {
                error = "Deposit amount must be greater than 0";
                return false;
            }

            return true;
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}