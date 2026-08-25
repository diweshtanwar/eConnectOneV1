--
-- PostgreSQL database dump
--

\restrict WjKOYzT2UxMJLdu63DMdZPIDblO1HJ6TRtDcw60aVjS8BWk8O8eNKNA2W36FDmc

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."WithdrawalDetails" DROP CONSTRAINT IF EXISTS "FK_WithdrawalDetails_Users_ApprovedByUserId";
ALTER TABLE IF EXISTS ONLY public."WithdrawalDetails" DROP CONSTRAINT IF EXISTS "FK_WithdrawalDetails_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."Wallets" DROP CONSTRAINT IF EXISTS "FK_Wallets_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."WalletTransactions" DROP CONSTRAINT IF EXISTS "FK_WalletTransactions_Wallets_WalletId";
ALTER TABLE IF EXISTS ONLY public."WalletTransactions" DROP CONSTRAINT IF EXISTS "FK_WalletTransactions_Users_CreatedByUserId";
ALTER TABLE IF EXISTS ONLY public."WalletTransactions" DROP CONSTRAINT IF EXISTS "FK_WalletTransactions_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."Users" DROP CONSTRAINT IF EXISTS "FK_Users_Roles_RoleId";
ALTER TABLE IF EXISTS ONLY public."UserLimits" DROP CONSTRAINT IF EXISTS "FK_UserLimits_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."UserDocuments" DROP CONSTRAINT IF EXISTS "FK_UserDocuments_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."UserDocuments" DROP CONSTRAINT IF EXISTS "FK_UserDocuments_UserDetails_Code";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_Statuses_StatusId";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_States_StateId";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_Locations_LocationId";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_Countries_CountryId";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "FK_UserDetails_Cities_CityId";
ALTER TABLE IF EXISTS ONLY public."TransactionAudits" DROP CONSTRAINT IF EXISTS "FK_TransactionAudits_WalletTransactions_WalletTransactionId";
ALTER TABLE IF EXISTS ONLY public."TransactionAudits" DROP CONSTRAINT IF EXISTS "FK_TransactionAudits_Users_PerformedByUserId";
ALTER TABLE IF EXISTS ONLY public."TransactionAudits" DROP CONSTRAINT IF EXISTS "FK_TransactionAudits_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "FK_Tickets_Users_UpdatedByUserId";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "FK_Tickets_Users_RaisedByUserId";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "FK_Tickets_Users_CreatedByUserId";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "FK_Tickets_TicketTypes_TypeId";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "FK_Tickets_TicketStatuses_StatusId";
ALTER TABLE IF EXISTS ONLY public."TicketHistory" DROP CONSTRAINT IF EXISTS "FK_TicketHistory_Users_ChangedByUserId";
ALTER TABLE IF EXISTS ONLY public."TicketHistory" DROP CONSTRAINT IF EXISTS "FK_TicketHistory_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."TechnicalDetails" DROP CONSTRAINT IF EXISTS "FK_TechnicalDetails_Users_ResolutionProvidedByUserId";
ALTER TABLE IF EXISTS ONLY public."TechnicalDetails" DROP CONSTRAINT IF EXISTS "FK_TechnicalDetails_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."TechnicalDetails" DROP CONSTRAINT IF EXISTS "FK_TechnicalDetails_ProblemTypes_ProblemTypeId";
ALTER TABLE IF EXISTS ONLY public."States" DROP CONSTRAINT IF EXISTS "FK_States_Countries_CountryId";
ALTER TABLE IF EXISTS ONLY public."SecurityLogs" DROP CONSTRAINT IF EXISTS "FK_SecurityLogs_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."RolePermissions" DROP CONSTRAINT IF EXISTS "FK_RolePermissions_Roles_RoleId";
ALTER TABLE IF EXISTS ONLY public."Resources" DROP CONSTRAINT IF EXISTS "FK_Resources_Users_UploadedByUserId";
ALTER TABLE IF EXISTS ONLY public."Resources" DROP CONSTRAINT IF EXISTS "FK_Resources_ResourceCategories_CategoryId";
ALTER TABLE IF EXISTS ONLY public."ResourceAccesses" DROP CONSTRAINT IF EXISTS "FK_ResourceAccesses_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."ResourceAccesses" DROP CONSTRAINT IF EXISTS "FK_ResourceAccesses_Resources_ResourceId";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "FK_Messages_Users_ToUserId";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "FK_Messages_Users_FromUserId";
ALTER TABLE IF EXISTS ONLY public."Locations" DROP CONSTRAINT IF EXISTS "FK_Locations_Cities_CityId";
ALTER TABLE IF EXISTS ONLY public."GroupChats" DROP CONSTRAINT IF EXISTS "FK_GroupChats_Users_CreatedByUserId";
ALTER TABLE IF EXISTS ONLY public."GroupChatMembers" DROP CONSTRAINT IF EXISTS "FK_GroupChatMembers_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."GroupChatMembers" DROP CONSTRAINT IF EXISTS "FK_GroupChatMembers_GroupChats_GroupId";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "FK_GeneralUserDetails_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "FK_GeneralUserDetails_States_StateId";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "FK_GeneralUserDetails_Designations_DesignationId";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "FK_GeneralUserDetails_Departments_DepartmentId";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "FK_GeneralUserDetails_Cities_CityId";
ALTER TABLE IF EXISTS ONLY public."Designations" DROP CONSTRAINT IF EXISTS "FK_Designations_Departments_DepartmentId";
ALTER TABLE IF EXISTS ONLY public."DepositDetails" DROP CONSTRAINT IF EXISTS "FK_DepositDetails_Users_ApprovedByUserId";
ALTER TABLE IF EXISTS ONLY public."DepositDetails" DROP CONSTRAINT IF EXISTS "FK_DepositDetails_Tickets_TicketId";
ALTER TABLE IF EXISTS ONLY public."Commissions" DROP CONSTRAINT IF EXISTS "FK_Commissions_Users_CreatedByUserId";
ALTER TABLE IF EXISTS ONLY public."Commissions" DROP CONSTRAINT IF EXISTS "FK_Commissions_Users_CSPUserId";
ALTER TABLE IF EXISTS ONLY public."Commissions" DROP CONSTRAINT IF EXISTS "FK_Commissions_Users_ApprovedByUserId";
ALTER TABLE IF EXISTS ONLY public."CommissionDocuments" DROP CONSTRAINT IF EXISTS "FK_CommissionDocuments_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."CommissionDocument" DROP CONSTRAINT IF EXISTS "FK_CommissionDocument_Users_UploadedByUserId";
ALTER TABLE IF EXISTS ONLY public."CommissionDocument" DROP CONSTRAINT IF EXISTS "FK_CommissionDocument_Commissions_CommissionId";
ALTER TABLE IF EXISTS ONLY public."CommissionBreakdowns" DROP CONSTRAINT IF EXISTS "FK_CommissionBreakdowns_Commissions_CommissionId";
ALTER TABLE IF EXISTS ONLY public."Cities" DROP CONSTRAINT IF EXISTS "FK_Cities_States_StateId";
ALTER TABLE IF EXISTS ONLY public."ChatMessages" DROP CONSTRAINT IF EXISTS "FK_ChatMessages_Users_ToUserId";
ALTER TABLE IF EXISTS ONLY public."ChatMessages" DROP CONSTRAINT IF EXISTS "FK_ChatMessages_Users_FromUserId";
ALTER TABLE IF EXISTS ONLY public."ChatMessages" DROP CONSTRAINT IF EXISTS "FK_ChatMessages_GroupChats_GroupChatId";
ALTER TABLE IF EXISTS ONLY public."Broadcasts" DROP CONSTRAINT IF EXISTS "FK_Broadcasts_Users_SentByUserId";
ALTER TABLE IF EXISTS ONLY public."BroadcastReceipts" DROP CONSTRAINT IF EXISTS "FK_BroadcastReceipts_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."BroadcastReceipts" DROP CONSTRAINT IF EXISTS "FK_BroadcastReceipts_Broadcasts_BroadcastId";
ALTER TABLE IF EXISTS ONLY public."AuditLogs" DROP CONSTRAINT IF EXISTS "FK_AuditLogs_Users_UserId";
ALTER TABLE IF EXISTS ONLY public."Attachments" DROP CONSTRAINT IF EXISTS "FK_Attachments_Users_UploadedByUserId";
ALTER TABLE IF EXISTS ONLY public."Attachments" DROP CONSTRAINT IF EXISTS "FK_Attachments_Tickets_TicketId";
DROP INDEX IF EXISTS public.idx_wallets_userid;
DROP INDEX IF EXISTS public.idx_users_roleid;
DROP INDEX IF EXISTS public.idx_users_email_isdeleted;
DROP INDEX IF EXISTS public.idx_userdocuments_code;
DROP INDEX IF EXISTS public.idx_userdetails_userid;
DROP INDEX IF EXISTS public.idx_tickets_statusid_isdeleted;
DROP INDEX IF EXISTS public.idx_generaluserdetails_userid;
DROP INDEX IF EXISTS public.idx_commissions_cspuserid_year_month;
DROP INDEX IF EXISTS public."IX_WithdrawalDetails_ApprovedByUserId";
DROP INDEX IF EXISTS public."IX_Wallets_UserId";
DROP INDEX IF EXISTS public."IX_WalletTransactions_WalletId";
DROP INDEX IF EXISTS public."IX_WalletTransactions_TicketId";
DROP INDEX IF EXISTS public."IX_WalletTransactions_CreatedByUserId";
DROP INDEX IF EXISTS public."IX_Users_RoleId";
DROP INDEX IF EXISTS public."IX_UserLimits_UserId";
DROP INDEX IF EXISTS public."IX_UserDocuments_UserId";
DROP INDEX IF EXISTS public."IX_UserDocuments_Code";
DROP INDEX IF EXISTS public."IX_UserDetails_UserId";
DROP INDEX IF EXISTS public."IX_UserDetails_StatusId";
DROP INDEX IF EXISTS public."IX_UserDetails_StateId";
DROP INDEX IF EXISTS public."IX_UserDetails_LocationId";
DROP INDEX IF EXISTS public."IX_UserDetails_CountryId";
DROP INDEX IF EXISTS public."IX_UserDetails_CityId";
DROP INDEX IF EXISTS public."IX_TransactionAudits_WalletTransactionId";
DROP INDEX IF EXISTS public."IX_TransactionAudits_TicketId";
DROP INDEX IF EXISTS public."IX_TransactionAudits_PerformedByUserId";
DROP INDEX IF EXISTS public."IX_Tickets_UpdatedByUserId";
DROP INDEX IF EXISTS public."IX_Tickets_Type_Status";
DROP INDEX IF EXISTS public."IX_Tickets_StatusId";
DROP INDEX IF EXISTS public."IX_Tickets_RaisedByUserId";
DROP INDEX IF EXISTS public."IX_Tickets_CreatedDate";
DROP INDEX IF EXISTS public."IX_Tickets_CreatedByUserId";
DROP INDEX IF EXISTS public."IX_TicketHistory_TicketId";
DROP INDEX IF EXISTS public."IX_TicketHistory_ChangedByUserId";
DROP INDEX IF EXISTS public."IX_TechnicalDetails_ResolutionProvidedByUserId";
DROP INDEX IF EXISTS public."IX_TechnicalDetails_ProblemTypeId";
DROP INDEX IF EXISTS public."IX_Statuses_Name";
DROP INDEX IF EXISTS public."IX_States_CountryId";
DROP INDEX IF EXISTS public."IX_SecurityLogs_UserId";
DROP INDEX IF EXISTS public."IX_Roles_Name";
DROP INDEX IF EXISTS public."IX_RolePermissions_RoleId";
DROP INDEX IF EXISTS public."IX_Resources_UploadedByUserId";
DROP INDEX IF EXISTS public."IX_Resources_CategoryId";
DROP INDEX IF EXISTS public."IX_ResourceAccesses_UserId";
DROP INDEX IF EXISTS public."IX_ResourceAccesses_ResourceId";
DROP INDEX IF EXISTS public."IX_Messages_ToUserId";
DROP INDEX IF EXISTS public."IX_Messages_FromUserId";
DROP INDEX IF EXISTS public."IX_Locations_CityId";
DROP INDEX IF EXISTS public."IX_GroupChats_CreatedByUserId";
DROP INDEX IF EXISTS public."IX_GroupChatMembers_UserId";
DROP INDEX IF EXISTS public."IX_GroupChatMembers_GroupId";
DROP INDEX IF EXISTS public."IX_GeneralUserDetails_UserId";
DROP INDEX IF EXISTS public."IX_GeneralUserDetails_StateId";
DROP INDEX IF EXISTS public."IX_GeneralUserDetails_DesignationId";
DROP INDEX IF EXISTS public."IX_GeneralUserDetails_DepartmentId";
DROP INDEX IF EXISTS public."IX_GeneralUserDetails_CityId";
DROP INDEX IF EXISTS public."IX_Designations_DepartmentId";
DROP INDEX IF EXISTS public."IX_DepositDetails_ApprovedByUserId";
DROP INDEX IF EXISTS public."IX_Departments_Name";
DROP INDEX IF EXISTS public."IX_Countries_Name";
DROP INDEX IF EXISTS public."IX_Commissions_CreatedByUserId";
DROP INDEX IF EXISTS public."IX_Commissions_ApprovedByUserId";
DROP INDEX IF EXISTS public."IX_Commission_CSP_Month_Year";
DROP INDEX IF EXISTS public."IX_CommissionDocuments_UserId";
DROP INDEX IF EXISTS public."IX_CommissionDocuments_CSPCode";
DROP INDEX IF EXISTS public."IX_CommissionDocument_UploadedByUserId";
DROP INDEX IF EXISTS public."IX_CommissionDocument_CommissionId";
DROP INDEX IF EXISTS public."IX_CommissionBreakdowns_CommissionId";
DROP INDEX IF EXISTS public."IX_Cities_StateId";
DROP INDEX IF EXISTS public."IX_ChatMessages_ToUserId";
DROP INDEX IF EXISTS public."IX_ChatMessages_GroupChatId";
DROP INDEX IF EXISTS public."IX_ChatMessages_FromUserId";
DROP INDEX IF EXISTS public."IX_Broadcasts_SentByUserId";
DROP INDEX IF EXISTS public."IX_BroadcastReceipts_UserId";
DROP INDEX IF EXISTS public."IX_BroadcastReceipts_BroadcastId";
DROP INDEX IF EXISTS public."IX_AuditLogs_UserId";
DROP INDEX IF EXISTS public."IX_Attachments_UploadedByUserId";
DROP INDEX IF EXISTS public."IX_Attachments_TicketId";
ALTER TABLE IF EXISTS ONLY public."__EFMigrationsHistory" DROP CONSTRAINT IF EXISTS "PK___EFMigrationsHistory";
ALTER TABLE IF EXISTS ONLY public."WithdrawalDetails" DROP CONSTRAINT IF EXISTS "PK_WithdrawalDetails";
ALTER TABLE IF EXISTS ONLY public."Wallets" DROP CONSTRAINT IF EXISTS "PK_Wallets";
ALTER TABLE IF EXISTS ONLY public."WalletTransactions" DROP CONSTRAINT IF EXISTS "PK_WalletTransactions";
ALTER TABLE IF EXISTS ONLY public."Users" DROP CONSTRAINT IF EXISTS "PK_Users";
ALTER TABLE IF EXISTS ONLY public."UserLimits" DROP CONSTRAINT IF EXISTS "PK_UserLimits";
ALTER TABLE IF EXISTS ONLY public."UserDocuments" DROP CONSTRAINT IF EXISTS "PK_UserDocuments";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "PK_UserDetails";
ALTER TABLE IF EXISTS ONLY public."TransactionAudits" DROP CONSTRAINT IF EXISTS "PK_TransactionAudits";
ALTER TABLE IF EXISTS ONLY public."Tickets" DROP CONSTRAINT IF EXISTS "PK_Tickets";
ALTER TABLE IF EXISTS ONLY public."TicketTypes" DROP CONSTRAINT IF EXISTS "PK_TicketTypes";
ALTER TABLE IF EXISTS ONLY public."TicketStatuses" DROP CONSTRAINT IF EXISTS "PK_TicketStatuses";
ALTER TABLE IF EXISTS ONLY public."TicketHistory" DROP CONSTRAINT IF EXISTS "PK_TicketHistory";
ALTER TABLE IF EXISTS ONLY public."TechnicalDetails" DROP CONSTRAINT IF EXISTS "PK_TechnicalDetails";
ALTER TABLE IF EXISTS ONLY public."Statuses" DROP CONSTRAINT IF EXISTS "PK_Statuses";
ALTER TABLE IF EXISTS ONLY public."States" DROP CONSTRAINT IF EXISTS "PK_States";
ALTER TABLE IF EXISTS ONLY public."SecurityLogs" DROP CONSTRAINT IF EXISTS "PK_SecurityLogs";
ALTER TABLE IF EXISTS ONLY public."Roles" DROP CONSTRAINT IF EXISTS "PK_Roles";
ALTER TABLE IF EXISTS ONLY public."RolePermissions" DROP CONSTRAINT IF EXISTS "PK_RolePermissions";
ALTER TABLE IF EXISTS ONLY public."Resources" DROP CONSTRAINT IF EXISTS "PK_Resources";
ALTER TABLE IF EXISTS ONLY public."ResourceCategories" DROP CONSTRAINT IF EXISTS "PK_ResourceCategories";
ALTER TABLE IF EXISTS ONLY public."ResourceAccesses" DROP CONSTRAINT IF EXISTS "PK_ResourceAccesses";
ALTER TABLE IF EXISTS ONLY public."ProblemTypes" DROP CONSTRAINT IF EXISTS "PK_ProblemTypes";
ALTER TABLE IF EXISTS ONLY public."Messages" DROP CONSTRAINT IF EXISTS "PK_Messages";
ALTER TABLE IF EXISTS ONLY public."Locations" DROP CONSTRAINT IF EXISTS "PK_Locations";
ALTER TABLE IF EXISTS ONLY public."GroupChats" DROP CONSTRAINT IF EXISTS "PK_GroupChats";
ALTER TABLE IF EXISTS ONLY public."GroupChatMembers" DROP CONSTRAINT IF EXISTS "PK_GroupChatMembers";
ALTER TABLE IF EXISTS ONLY public."GeneralUserDetails" DROP CONSTRAINT IF EXISTS "PK_GeneralUserDetails";
ALTER TABLE IF EXISTS ONLY public."Designations" DROP CONSTRAINT IF EXISTS "PK_Designations";
ALTER TABLE IF EXISTS ONLY public."DepositDetails" DROP CONSTRAINT IF EXISTS "PK_DepositDetails";
ALTER TABLE IF EXISTS ONLY public."Departments" DROP CONSTRAINT IF EXISTS "PK_Departments";
ALTER TABLE IF EXISTS ONLY public."Countries" DROP CONSTRAINT IF EXISTS "PK_Countries";
ALTER TABLE IF EXISTS ONLY public."Commissions" DROP CONSTRAINT IF EXISTS "PK_Commissions";
ALTER TABLE IF EXISTS ONLY public."CommissionDocuments" DROP CONSTRAINT IF EXISTS "PK_CommissionDocuments";
ALTER TABLE IF EXISTS ONLY public."CommissionDocument" DROP CONSTRAINT IF EXISTS "PK_CommissionDocument";
ALTER TABLE IF EXISTS ONLY public."CommissionBreakdowns" DROP CONSTRAINT IF EXISTS "PK_CommissionBreakdowns";
ALTER TABLE IF EXISTS ONLY public."Cities" DROP CONSTRAINT IF EXISTS "PK_Cities";
ALTER TABLE IF EXISTS ONLY public."ChatMessages" DROP CONSTRAINT IF EXISTS "PK_ChatMessages";
ALTER TABLE IF EXISTS ONLY public."Broadcasts" DROP CONSTRAINT IF EXISTS "PK_Broadcasts";
ALTER TABLE IF EXISTS ONLY public."BroadcastReceipts" DROP CONSTRAINT IF EXISTS "PK_BroadcastReceipts";
ALTER TABLE IF EXISTS ONLY public."AuditLogs" DROP CONSTRAINT IF EXISTS "PK_AuditLogs";
ALTER TABLE IF EXISTS ONLY public."Attachments" DROP CONSTRAINT IF EXISTS "PK_Attachments";
ALTER TABLE IF EXISTS ONLY public."UserDetails" DROP CONSTRAINT IF EXISTS "AK_UserDetails_Code";
ALTER TABLE IF EXISTS ONLY public."GroupChats" DROP CONSTRAINT IF EXISTS "AK_GroupChats_GroupId";
DROP TABLE IF EXISTS public."__EFMigrationsHistory";
DROP TABLE IF EXISTS public."WithdrawalDetails";
DROP TABLE IF EXISTS public."Wallets";
DROP TABLE IF EXISTS public."WalletTransactions";
DROP TABLE IF EXISTS public."Users";
DROP TABLE IF EXISTS public."UserLimits";
DROP TABLE IF EXISTS public."UserDocuments";
DROP TABLE IF EXISTS public."UserDetails";
DROP TABLE IF EXISTS public."TransactionAudits";
DROP TABLE IF EXISTS public."Tickets";
DROP TABLE IF EXISTS public."TicketTypes";
DROP TABLE IF EXISTS public."TicketStatuses";
DROP TABLE IF EXISTS public."TicketHistory";
DROP TABLE IF EXISTS public."TechnicalDetails";
DROP TABLE IF EXISTS public."Statuses";
DROP TABLE IF EXISTS public."States";
DROP TABLE IF EXISTS public."SecurityLogs";
DROP TABLE IF EXISTS public."Roles";
DROP TABLE IF EXISTS public."RolePermissions";
DROP TABLE IF EXISTS public."Resources";
DROP TABLE IF EXISTS public."ResourceCategories";
DROP TABLE IF EXISTS public."ResourceAccesses";
DROP TABLE IF EXISTS public."ProblemTypes";
DROP TABLE IF EXISTS public."Messages";
DROP TABLE IF EXISTS public."Locations";
DROP TABLE IF EXISTS public."GroupChats";
DROP TABLE IF EXISTS public."GroupChatMembers";
DROP TABLE IF EXISTS public."GeneralUserDetails";
DROP TABLE IF EXISTS public."Designations";
DROP TABLE IF EXISTS public."DepositDetails";
DROP TABLE IF EXISTS public."Departments";
DROP TABLE IF EXISTS public."Countries";
DROP TABLE IF EXISTS public."Commissions";
DROP TABLE IF EXISTS public."CommissionDocuments";
DROP TABLE IF EXISTS public."CommissionDocument";
DROP TABLE IF EXISTS public."CommissionBreakdowns";
DROP TABLE IF EXISTS public."Cities";
DROP TABLE IF EXISTS public."ChatMessages";
DROP TABLE IF EXISTS public."Broadcasts";
DROP TABLE IF EXISTS public."BroadcastReceipts";
DROP TABLE IF EXISTS public."AuditLogs";
DROP TABLE IF EXISTS public."Attachments";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Attachments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Attachments" (
    "AttachmentId" uuid NOT NULL,
    "TicketId" uuid NOT NULL,
    "FileName" character varying(255) NOT NULL,
    "FilePath" text NOT NULL,
    "FileType" character varying(50),
    "UploadedByUserId" integer NOT NULL,
    "UploadedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: AuditLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."AuditLogs" (
    "Id" integer NOT NULL,
    "Action" character varying(50) NOT NULL,
    "EntityType" character varying(100) NOT NULL,
    "EntityId" character varying(50) NOT NULL,
    "OldValue" text,
    "NewValue" text,
    "UserId" integer NOT NULL,
    "IpAddress" character varying(50),
    "Timestamp" timestamp with time zone NOT NULL
);


--
-- Name: AuditLogs_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."AuditLogs" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."AuditLogs_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: BroadcastReceipts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."BroadcastReceipts" (
    "Id" integer NOT NULL,
    "BroadcastId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "IsRead" boolean NOT NULL,
    "ReadAt" timestamp with time zone,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: BroadcastReceipts_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."BroadcastReceipts" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."BroadcastReceipts_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Broadcasts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Broadcasts" (
    "Id" integer NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Message" text NOT NULL,
    "Priority" character varying(20) NOT NULL,
    "SentByUserId" integer NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ExpiresAt" timestamp with time zone,
    "IsActive" boolean NOT NULL,
    "TargetRoles" character varying(255) NOT NULL
);


--
-- Name: Broadcasts_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Broadcasts" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Broadcasts_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ChatMessages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ChatMessages" (
    "Id" integer NOT NULL,
    "ConversationId" character varying(100) NOT NULL,
    "FromUserId" integer NOT NULL,
    "ToUserId" integer NOT NULL,
    "Message" text NOT NULL,
    "IsRead" boolean NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ReadAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "MessageType" character varying(20) NOT NULL,
    "GroupChatId" integer
);


--
-- Name: ChatMessages_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."ChatMessages" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ChatMessages_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Cities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Cities" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "StateId" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Cities_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Cities" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Cities_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: CommissionBreakdowns; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CommissionBreakdowns" (
    "Id" uuid NOT NULL,
    "CommissionId" uuid NOT NULL,
    "ServiceType" character varying(100) NOT NULL,
    "TransactionCount" integer NOT NULL,
    "TransactionVolume" numeric(18,2) NOT NULL,
    "CommissionRate" numeric(18,2) NOT NULL,
    "CommissionAmount" numeric(18,2) NOT NULL,
    "Notes" character varying(500)
);


--
-- Name: CommissionDocument; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CommissionDocument" (
    "Id" uuid NOT NULL,
    "CommissionId" uuid NOT NULL,
    "FileName" character varying(255) NOT NULL,
    "FilePath" character varying(500) NOT NULL,
    "FileType" character varying(100),
    "DocumentType" character varying(20) NOT NULL,
    "FileSize" bigint NOT NULL,
    "UploadedByUserId" integer NOT NULL,
    "UploadedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: CommissionDocuments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CommissionDocuments" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "CSPCode" character varying(50) NOT NULL,
    "DocumentType" character varying(50) NOT NULL,
    "DocumentPath" character varying(500) NOT NULL,
    "UploadedDate" timestamp with time zone NOT NULL,
    "Description" character varying(255),
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone,
    "CreatedDate" timestamp with time zone NOT NULL,
    "UpdatedDate" timestamp with time zone
);


--
-- Name: CommissionDocuments_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."CommissionDocuments" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."CommissionDocuments_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Commissions" (
    "CommissionId" uuid NOT NULL,
    "CSPUserId" integer NOT NULL,
    "Month" integer NOT NULL,
    "Year" integer NOT NULL,
    "BaseCommission" numeric(18,2) NOT NULL,
    "BonusCommission" numeric(18,2) NOT NULL,
    "Deductions" numeric(18,2) NOT NULL,
    "TotalCommission" numeric(18,2) NOT NULL,
    "TaxDeducted" numeric(18,2) NOT NULL,
    "NetPayable" numeric(18,2) NOT NULL,
    "Status" character varying(20) NOT NULL,
    "Description" character varying(1000),
    "Remarks" character varying(500),
    "PaymentDate" timestamp with time zone,
    "PaymentReference" character varying(100),
    "CreatedByUserId" integer NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ApprovedByUserId" integer,
    "ApprovedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL
);


--
-- Name: Countries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Countries" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL
);


--
-- Name: Countries_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Countries" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Countries_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Departments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Departments" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Departments_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Departments" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Departments_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: DepositDetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."DepositDetails" (
    "TicketId" uuid NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "DepositDate" timestamp with time zone,
    "HasReceipt" boolean NOT NULL,
    "ReceiptSource" text,
    "IsVerified" boolean NOT NULL,
    "ApprovedAmount" numeric(18,2),
    "ApprovedByUserId" integer,
    "ApprovedDate" timestamp with time zone,
    "ApprovalComment" character varying(500)
);


--
-- Name: Designations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Designations" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "DepartmentId" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Designations_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Designations" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Designations_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: GeneralUserDetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GeneralUserDetails" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "Address" character varying(500),
    "Qualification" character varying(255),
    "ProfilePicSource" character varying(500),
    "CityId" integer,
    "StateId" integer,
    "DepartmentId" integer,
    "DesignationId" integer,
    "CreatedDate" timestamp with time zone NOT NULL,
    "CreatedBy" text,
    "UpdatedDate" timestamp with time zone,
    "UpdatedBy" text,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: GeneralUserDetails_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."GeneralUserDetails" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."GeneralUserDetails_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: GroupChatMembers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GroupChatMembers" (
    "Id" integer NOT NULL,
    "GroupId" character varying(100) NOT NULL,
    "UserId" integer NOT NULL,
    "JoinedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsAdmin" boolean NOT NULL,
    "IsActive" boolean NOT NULL
);


--
-- Name: GroupChatMembers_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."GroupChatMembers" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."GroupChatMembers_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: GroupChats; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."GroupChats" (
    "Id" integer NOT NULL,
    "GroupId" character varying(100) NOT NULL,
    "GroupName" character varying(255) NOT NULL,
    "GroupDescription" character varying(500),
    "CreatedByUserId" integer NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "IsActive" boolean NOT NULL
);


--
-- Name: GroupChats_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."GroupChats" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."GroupChats_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Locations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Locations" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "CityId" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Locations_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Locations" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Locations_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Messages" (
    "Id" integer NOT NULL,
    "FromUserId" integer NOT NULL,
    "ToUserId" integer NOT NULL,
    "Subject" character varying(255) NOT NULL,
    "Body" text NOT NULL,
    "IsRead" boolean NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "ReadAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedAt" timestamp with time zone,
    "Priority" character varying(20) NOT NULL,
    "HasAttachment" boolean NOT NULL
);


--
-- Name: Messages_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Messages" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Messages_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ProblemTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ProblemTypes" (
    "ProblemTypeId" integer NOT NULL,
    "ProblemTypeName" character varying(100) NOT NULL,
    "Description" character varying(255)
);


--
-- Name: ProblemTypes_ProblemTypeId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."ProblemTypes" ALTER COLUMN "ProblemTypeId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ProblemTypes_ProblemTypeId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ResourceAccesses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ResourceAccesses" (
    "Id" integer NOT NULL,
    "ResourceId" integer NOT NULL,
    "UserId" integer NOT NULL,
    "AccessType" character varying(20) NOT NULL,
    "AccessedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UserAgent" character varying(500),
    "IpAddress" character varying(50)
);


--
-- Name: ResourceAccesses_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."ResourceAccesses" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ResourceAccesses_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ResourceCategories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ResourceCategories" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "Description" character varying(500) NOT NULL,
    "Icon" character varying(50) NOT NULL,
    "Color" character varying(20) NOT NULL,
    "SortOrder" integer NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ResourceCategories_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."ResourceCategories" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."ResourceCategories_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Resources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Resources" (
    "Id" integer NOT NULL,
    "Title" character varying(255) NOT NULL,
    "Description" character varying(1000) NOT NULL,
    "ResourceType" character varying(20) NOT NULL,
    "ExternalUrl" character varying(1000),
    "FileName" character varying(255),
    "FilePath" character varying(500),
    "FileSize" bigint,
    "MimeType" character varying(100),
    "CategoryId" integer NOT NULL,
    "TargetRoles" character varying(255) NOT NULL,
    "Priority" character varying(20) NOT NULL,
    "UploadedByUserId" integer NOT NULL,
    "CreatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedAt" timestamp with time zone,
    "IsActive" boolean NOT NULL,
    "IsFeatured" boolean NOT NULL,
    "DownloadCount" integer NOT NULL,
    "ViewCount" integer NOT NULL
);


--
-- Name: Resources_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Resources" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Resources_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: RolePermissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RolePermissions" (
    "Id" integer NOT NULL,
    "RoleId" integer NOT NULL,
    "Permission" character varying(100) NOT NULL,
    "CanView" boolean NOT NULL,
    "CanCreate" boolean NOT NULL,
    "CanEdit" boolean NOT NULL,
    "CanDelete" boolean NOT NULL,
    "CreatedDate" timestamp with time zone NOT NULL,
    "UpdatedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL
);


--
-- Name: RolePermissions_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."RolePermissions" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."RolePermissions_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Roles" (
    "Id" integer NOT NULL,
    "Name" character varying(50) NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Roles_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Roles" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Roles_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: SecurityLogs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."SecurityLogs" (
    "Id" integer NOT NULL,
    "EventType" character varying(50) NOT NULL,
    "Description" character varying(1000) NOT NULL,
    "UserId" integer,
    "IpAddress" character varying(50),
    "UserAgent" character varying(500),
    "Timestamp" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: SecurityLogs_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."SecurityLogs" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."SecurityLogs_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: States; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."States" (
    "Id" integer NOT NULL,
    "Name" character varying(255) NOT NULL,
    "CountryId" integer NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: States_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."States" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."States_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Statuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Statuses" (
    "Id" integer NOT NULL,
    "Name" character varying(50) NOT NULL,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Statuses_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Statuses" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Statuses_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: TechnicalDetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TechnicalDetails" (
    "TicketId" uuid NOT NULL,
    "ProblemTypeId" integer,
    "ResolutionProvidedByUserId" integer,
    "AnyDeskDetail" character varying(255)
);


--
-- Name: TicketHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketHistory" (
    "HistoryId" uuid NOT NULL,
    "TicketId" uuid NOT NULL,
    "ChangeType" character varying(100) NOT NULL,
    "OldValue" text,
    "NewValue" text,
    "ChangedByUserId" integer NOT NULL,
    "ChangedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: TicketStatuses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketStatuses" (
    "StatusId" integer NOT NULL,
    "StatusName" character varying(50) NOT NULL,
    "Description" character varying(255)
);


--
-- Name: TicketStatuses_StatusId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."TicketStatuses" ALTER COLUMN "StatusId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TicketStatuses_StatusId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: TicketTypes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TicketTypes" (
    "TypeId" integer NOT NULL,
    "TypeName" character varying(50) NOT NULL,
    "Description" character varying(255)
);


--
-- Name: TicketTypes_TypeId_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."TicketTypes" ALTER COLUMN "TypeId" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."TicketTypes_TypeId_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Tickets" (
    "TicketId" uuid NOT NULL,
    "TypeId" integer NOT NULL,
    "RaisedByUserId" integer NOT NULL,
    "RequesterEmail" character varying(255),
    "RequesterMobile" character varying(20),
    "Summary" character varying(255) NOT NULL,
    "Description" text,
    "StatusId" integer NOT NULL,
    "RequestedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "CompletionDate" timestamp with time zone,
    "ResolutionDetail" text,
    "Comment" text,
    "CreatedByUserId" integer NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedByUserId" integer,
    "UpdatedDate" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone,
    "Priority" character varying(10) NOT NULL,
    "PriorityScore" integer NOT NULL
);


--
-- Name: TransactionAudits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransactionAudits" (
    "Id" uuid NOT NULL,
    "TicketId" uuid,
    "WalletTransactionId" uuid,
    "Action" character varying(50) NOT NULL,
    "OldAmount" numeric(18,2),
    "NewAmount" numeric(18,2),
    "BalanceBefore" numeric(18,2),
    "BalanceAfter" numeric(18,2),
    "PerformedByUserId" integer NOT NULL,
    "IpAddress" character varying(100),
    "UserAgent" character varying(500),
    "Reason" character varying(1000),
    "RiskLevel" character varying(20) NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: UserDetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserDetails" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "Name" character varying(255),
    "Code" character varying(50) NOT NULL,
    "BranchCode" character varying(50),
    "ExpiryDate" timestamp with time zone,
    "BankName" character varying(255),
    "BankAccount" character varying(50),
    "IFSC" character varying(20),
    "CertificateStatus" character varying(50),
    "StatusId" integer,
    "CountryId" integer,
    "StateId" integer,
    "CityId" integer,
    "LocationId" integer,
    "Category" character varying(100),
    "PAN" character varying(20),
    "VoterId" character varying(20),
    "AadharNo" character varying(20),
    "Education" character varying(255),
    "CreatedDate" timestamp with time zone NOT NULL,
    "CreatedBy" text,
    "UpdatedDate" timestamp with time zone,
    "UpdatedBy" text,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: UserDetails_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."UserDetails" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."UserDetails_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: UserDocuments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserDocuments" (
    "Id" integer NOT NULL,
    "Code" character varying(50) NOT NULL,
    "UserId" integer NOT NULL,
    "DocumentType" character varying(50) NOT NULL,
    "DocumentPath" character varying(500) NOT NULL,
    "UploadedDate" timestamp with time zone NOT NULL,
    "Description" character varying(255),
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone,
    "CreatedDate" timestamp with time zone NOT NULL,
    "UpdatedDate" timestamp with time zone
);


--
-- Name: UserDocuments_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."UserDocuments" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."UserDocuments_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: UserLimits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserLimits" (
    "Id" integer NOT NULL,
    "UserId" integer NOT NULL,
    "DailyWithdrawalLimit" numeric(18,2) NOT NULL,
    "MonthlyWithdrawalLimit" numeric(18,2) NOT NULL,
    "SingleTransactionLimit" numeric(18,2) NOT NULL,
    "DailyTransactionCount" integer NOT NULL,
    "MinimumBalance" numeric(18,2) NOT NULL,
    "RequireApprovalAbove" boolean NOT NULL,
    "ApprovalThreshold" numeric(18,2) NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedDate" timestamp with time zone
);


--
-- Name: UserLimits_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."UserLimits" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."UserLimits_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: Users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Users" (
    "Id" integer NOT NULL,
    "Username" character varying(100) NOT NULL,
    "PasswordHash" text NOT NULL,
    "MobileNumber" character varying(20),
    "EmergencyContactNumber" character varying(20),
    "FatherName" character varying(255),
    "MotherName" character varying(255),
    "RoleId" integer NOT NULL,
    "CreatedAt" timestamp with time zone NOT NULL,
    "LastLoginAt" timestamp with time zone,
    "UpdatedDate" timestamp with time zone,
    "IsActive" boolean NOT NULL,
    "Email" character varying(255),
    "FullName" character varying(255),
    "FailedLoginAttempts" integer NOT NULL,
    "IsLocked" boolean NOT NULL,
    "LockedUntil" timestamp with time zone,
    "LastFailedLoginAt" timestamp with time zone,
    "IsDeleted" boolean NOT NULL,
    "DeletedDate" timestamp with time zone
);


--
-- Name: Users_Id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public."Users" ALTER COLUMN "Id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public."Users_Id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: WalletTransactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WalletTransactions" (
    "TransactionId" uuid NOT NULL,
    "WalletId" uuid NOT NULL,
    "TicketId" uuid,
    "TransactionType" character varying(20) NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "BalanceAfter" numeric(18,2) NOT NULL,
    "Description" character varying(500),
    "Status" character varying(20) NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "CreatedByUserId" integer NOT NULL
);


--
-- Name: Wallets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Wallets" (
    "WalletId" uuid NOT NULL,
    "UserId" integer NOT NULL,
    "Balance" numeric(18,2) NOT NULL,
    "PendingAmount" numeric(18,2) NOT NULL,
    "IsActive" boolean NOT NULL,
    "CreatedDate" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "UpdatedDate" timestamp with time zone
);


--
-- Name: WithdrawalDetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WithdrawalDetails" (
    "TicketId" uuid NOT NULL,
    "Amount" numeric(18,2) NOT NULL,
    "Account" character varying(100),
    "IsConfigured" boolean NOT NULL,
    "IsMake" boolean NOT NULL,
    "IsAuthorized" boolean NOT NULL,
    "AuthorizedAmount" numeric(18,2),
    "ApprovedAmount" numeric(18,2),
    "ApprovedByUserId" integer,
    "ApprovedDate" timestamp with time zone,
    "ApprovalComment" character varying(500)
);


--
-- Name: __EFMigrationsHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL
);


--
-- Data for Name: Attachments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Attachments" ("AttachmentId", "TicketId", "FileName", "FilePath", "FileType", "UploadedByUserId", "UploadedDate") FROM stdin;
\.


--
-- Data for Name: AuditLogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLogs" ("Id", "Action", "EntityType", "EntityId", "OldValue", "NewValue", "UserId", "IpAddress", "Timestamp") FROM stdin;
\.


--
-- Data for Name: BroadcastReceipts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."BroadcastReceipts" ("Id", "BroadcastId", "UserId", "IsRead", "ReadAt", "CreatedAt") FROM stdin;
1	1	2	f	\N	2025-09-17 23:52:27.932064+05:30
2	1	3	f	\N	2025-09-17 23:52:27.932239+05:30
3	1	4	f	\N	2025-09-17 23:52:27.932239+05:30
5	2	2	f	\N	2025-09-17 23:52:34.154658+05:30
6	2	3	f	\N	2025-09-17 23:52:34.154658+05:30
7	2	4	f	\N	2025-09-17 23:52:34.154659+05:30
9	3	2	f	\N	2025-09-17 23:52:35.641651+05:30
10	3	3	f	\N	2025-09-17 23:52:35.641652+05:30
11	3	4	f	\N	2025-09-17 23:52:35.641652+05:30
12	3	1	t	2025-09-17 23:54:01.421836+05:30	2025-09-17 23:52:35.641652+05:30
8	2	1	t	2025-09-17 23:54:01.823691+05:30	2025-09-17 23:52:34.154659+05:30
4	1	1	t	2025-09-17 23:54:02.294209+05:30	2025-09-17 23:52:27.932239+05:30
13	4	2	f	\N	2025-11-16 19:03:55.48995+05:30
15	5	2	f	\N	2025-11-16 20:04:01.913965+05:30
17	6	7	f	\N	2025-11-16 20:31:06.443169+05:30
18	6	2	f	\N	2025-11-16 20:31:06.443534+05:30
20	6	6	f	\N	2025-11-16 20:31:06.443535+05:30
21	6	10	f	\N	2025-11-16 20:31:06.443535+05:30
19	6	1	t	2025-11-16 20:36:38.667016+05:30	2025-11-16 20:31:06.443534+05:30
16	5	1	t	2025-11-16 20:36:39.329605+05:30	2025-11-16 20:04:01.914349+05:30
14	4	1	t	2025-11-16 20:36:39.519325+05:30	2025-11-16 19:03:55.490202+05:30
\.


--
-- Data for Name: Broadcasts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Broadcasts" ("Id", "Title", "Message", "Priority", "SentByUserId", "CreatedAt", "ExpiresAt", "IsActive", "TargetRoles") FROM stdin;
1	New Ticket Created	A new ticket (#b36f414f-c151-452b-ae77-02b537cea008) has been created: sdfgvbhn	Normal	1	2025-09-17 23:52:27.649598+05:30	\N	t	Admin,Master Admin,HO User
2	New Ticket Created	A new ticket (#d3db0efe-b9fe-431a-b969-cd8cca5ff4f9) has been created: sdfgvbhn	Normal	1	2025-09-17 23:52:34.111083+05:30	\N	t	Admin,Master Admin,HO User
3	New Ticket Created	A new ticket (#2acbeb46-313d-4b0b-96cf-4b6d85b8d038) has been created: sdfgvbhn	Normal	1	2025-09-17 23:52:35.62367+05:30	\N	t	Admin,Master Admin,HO User
4	New Ticket Created	A new ticket (#bb3c8b1d-c385-4d33-8a42-1f0bfe76e4d8) has been created: App Crashes on Launch After Latest Update	Normal	1	2025-11-16 19:03:55.227796+05:30	\N	t	Admin,Master Admin,HO User
5	New Ticket Created	A new ticket (#0d8c057e-f704-4d70-8a7a-303a897b5bf7) has been created: New App Crashes on Launch After Latest Update	Normal	10	2025-11-16 20:04:01.742165+05:30	\N	t	Admin,Master Admin,HO User
6	test	test	Normal	1	2025-11-16 20:31:06.389905+05:30	2025-11-20 02:00:00+05:30	t	All
\.


--
-- Data for Name: ChatMessages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ChatMessages" ("Id", "ConversationId", "FromUserId", "ToUserId", "Message", "IsRead", "CreatedAt", "ReadAt", "IsDeleted", "MessageType", "GroupChatId") FROM stdin;
\.


--
-- Data for Name: Cities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Cities" ("Id", "Name", "StateId", "IsDeleted", "DeletedDate") FROM stdin;
37	Amaravati	1	f	\N
38	Itanagar	2	f	\N
39	Guwahati	3	f	\N
40	Patna	4	f	\N
41	Raipur	5	f	\N
42	Panaji	6	f	\N
43	Ahmedabad	7	f	\N
44	Chandigarh	8	f	\N
45	Shimla	9	f	\N
46	Ranchi	10	f	\N
47	Bengaluru	11	f	\N
48	Thiruvananthapuram	12	f	\N
49	Bhopal	13	f	\N
50	Mumbai	14	f	\N
51	Imphal	15	f	\N
52	Shillong	16	f	\N
53	Aizawl	17	f	\N
54	Kohima	18	f	\N
55	Bhubaneswar	19	f	\N
56	Amritsar	20	f	\N
57	Jaipur	21	f	\N
58	Gangtok	22	f	\N
59	Chennai	23	f	\N
60	Hyderabad	24	f	\N
61	Agartala	25	f	\N
62	Lucknow	26	f	\N
63	Dehradun	27	f	\N
64	Kolkata	28	f	\N
65	Port Blair	29	f	\N
66	Chandigarh	30	f	\N
67	Daman	31	f	\N
68	New Delhi	32	f	\N
69	Srinagar	33	f	\N
70	Leh	34	f	\N
71	Kavaratti	35	f	\N
72	Puducherry	36	f	\N
\.


--
-- Data for Name: CommissionBreakdowns; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CommissionBreakdowns" ("Id", "CommissionId", "ServiceType", "TransactionCount", "TransactionVolume", "CommissionRate", "CommissionAmount", "Notes") FROM stdin;
\.


--
-- Data for Name: CommissionDocument; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CommissionDocument" ("Id", "CommissionId", "FileName", "FilePath", "FileType", "DocumentType", "FileSize", "UploadedByUserId", "UploadedDate") FROM stdin;
\.


--
-- Data for Name: CommissionDocuments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CommissionDocuments" ("Id", "UserId", "CSPCode", "DocumentType", "DocumentPath", "UploadedDate", "Description", "IsDeleted", "DeletedDate", "CreatedDate", "UpdatedDate") FROM stdin;
\.


--
-- Data for Name: Commissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Commissions" ("CommissionId", "CSPUserId", "Month", "Year", "BaseCommission", "BonusCommission", "Deductions", "TotalCommission", "TaxDeducted", "NetPayable", "Status", "Description", "Remarks", "PaymentDate", "PaymentReference", "CreatedByUserId", "CreatedDate", "ApprovedByUserId", "ApprovedDate", "IsDeleted") FROM stdin;
400e9057-f82d-478e-abda-e314f471f9d0	10	11	2025	1500.00	20.00	10.00	1510.00	0.00	1510.00	APPROVED			\N	\N	1	2025-11-16 20:41:16.060207+05:30	1	2025-11-16 21:14:33.541928+05:30	f
\.


--
-- Data for Name: Countries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Countries" ("Id", "Name") FROM stdin;
1	India
\.


--
-- Data for Name: Departments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Departments" ("Id", "Name", "IsDeleted", "DeletedDate") FROM stdin;
\.


--
-- Data for Name: DepositDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."DepositDetails" ("TicketId", "Amount", "DepositDate", "HasReceipt", "ReceiptSource", "IsVerified", "ApprovedAmount", "ApprovedByUserId", "ApprovedDate", "ApprovalComment") FROM stdin;
\.


--
-- Data for Name: Designations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Designations" ("Id", "Name", "DepartmentId", "IsDeleted", "DeletedDate") FROM stdin;
\.


--
-- Data for Name: GeneralUserDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GeneralUserDetails" ("Id", "UserId", "Address", "Qualification", "ProfilePicSource", "CityId", "StateId", "DepartmentId", "DesignationId", "CreatedDate", "CreatedBy", "UpdatedDate", "UpdatedBy", "IsDeleted", "DeletedDate") FROM stdin;
1	2	\N	\N	\N	\N	\N	\N	\N	2025-09-17 22:23:09.522828+05:30	\N	\N	\N	f	\N
2	3	\N	\N	\N	\N	\N	\N	\N	2025-09-17 22:26:53.031639+05:30	\N	2025-09-20 11:21:01.5964+05:30	\N	t	2025-09-20 11:21:01.596332+05:30
3	4	\N	\N	\N	\N	\N	\N	\N	2025-09-17 22:27:39.424069+05:30	\N	2025-09-20 11:21:07.67635+05:30	\N	t	2025-09-20 11:21:07.676349+05:30
4	11	\N	\N	\N	\N	\N	\N	\N	2025-11-16 22:18:38.28744+05:30	\N	\N	\N	f	\N
\.


--
-- Data for Name: GroupChatMembers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GroupChatMembers" ("Id", "GroupId", "UserId", "JoinedAt", "IsAdmin", "IsActive") FROM stdin;
\.


--
-- Data for Name: GroupChats; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."GroupChats" ("Id", "GroupId", "GroupName", "GroupDescription", "CreatedByUserId", "CreatedAt", "IsActive") FROM stdin;
\.


--
-- Data for Name: Locations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Locations" ("Id", "Name", "CityId", "IsDeleted", "DeletedDate") FROM stdin;
\.


--
-- Data for Name: Messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Messages" ("Id", "FromUserId", "ToUserId", "Subject", "Body", "IsRead", "CreatedAt", "ReadAt", "IsDeleted", "DeletedAt", "Priority", "HasAttachment") FROM stdin;
\.


--
-- Data for Name: ProblemTypes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ProblemTypes" ("ProblemTypeId", "ProblemTypeName", "Description") FROM stdin;
1	Software Bug	Application crashes, errors, or unexpected behavior
2	Hardware Issue	Computer, printer, or device malfunction
3	Network Problem	Internet connectivity or network access issues
4	Login Issue	Unable to login or authentication problems
5	Performance Issue	Slow system or application performance
\.


--
-- Data for Name: ResourceAccesses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ResourceAccesses" ("Id", "ResourceId", "UserId", "AccessType", "AccessedAt", "UserAgent", "IpAddress") FROM stdin;
1	1	1	View	2025-09-20 14:04:34.412701+05:30	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	::1
\.


--
-- Data for Name: ResourceCategories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ResourceCategories" ("Id", "Name", "Description", "Icon", "Color", "SortOrder", "IsActive", "CreatedAt") FROM stdin;
1	Software & Tools	Applications and utilities	Apps	primary	1	t	2024-01-01 05:30:00+05:30
2	Training Materials	Educational content and tutorials	School	secondary	2	t	2024-01-01 05:30:00+05:30
3	Forms & Templates	Downloadable forms and templates	Description	success	3	t	2024-01-01 05:30:00+05:30
4	CSP Resources	CSP-specific materials	Person	warning	4	t	2024-01-01 05:30:00+05:30
5	Policies & Procedures	Company guidelines and procedures	Gavel	info	5	t	2024-01-01 05:30:00+05:30
6	Training Materials	Guides, tutorials, and onboarding content for client teams.	ðŸ“˜	#007BFF	1	t	2025-09-16 21:56:40.240968+05:30
7	Software Downloads	Access licensed software, updates, and installation packages.	ðŸ’»	#28A745	2	t	2025-09-16 21:56:40.240968+05:30
8	Product Documentation	Detailed manuals, specs, and technical documentation.	ðŸ“„	#6C757D	3	t	2025-09-16 21:56:40.240968+05:30
9	Support Resources	FAQs, troubleshooting guides, and contact info for help.	ðŸ› ï¸	#FFC107	4	t	2025-09-16 21:56:40.240968+05:30
10	Compliance & Policies	Legal, regulatory, and internal policy documents.	âš–ï¸	#DC3545	5	t	2025-09-16 21:56:40.240968+05:30
11	Client Tools	Custom-built tools and dashboards tailored for client workflows.	ðŸ§°	#17A2B8	6	t	2025-09-16 21:56:40.240968+05:30
12	Media & Assets	Logos, templates, videos, and brand assets.	ðŸŽ¥	#6610F2	7	t	2025-09-16 21:56:40.240968+05:30
13	Announcements & Updates	Latest news, feature releases, and service alerts.	ðŸ“¢	#20C997	8	t	2025-09-16 21:56:40.240968+05:30
\.


--
-- Data for Name: Resources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Resources" ("Id", "Title", "Description", "ResourceType", "ExternalUrl", "FileName", "FilePath", "FileSize", "MimeType", "CategoryId", "TargetRoles", "Priority", "UploadedByUserId", "CreatedAt", "UpdatedAt", "IsActive", "IsFeatured", "DownloadCount", "ViewCount") FROM stdin;
1	Software	desc	Link	https://meet.google.com/landing?hs=197&authuser=0	\N	\N	\N	\N	1	All	High	1	2025-09-20 14:04:18.687535+05:30	\N	t	t	0	1
\.


--
-- Data for Name: RolePermissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RolePermissions" ("Id", "RoleId", "Permission", "CanView", "CanCreate", "CanEdit", "CanDelete", "CreatedDate", "UpdatedDate", "IsDeleted") FROM stdin;
1	1	Dashboard	t	t	t	t	2025-09-16 22:36:15.926901+05:30	\N	f
2	1	UserManagement	t	t	t	t	2025-09-16 22:36:15.926901+05:30	\N	f
3	1	TicketManagement	t	t	t	t	2025-09-16 22:36:15.926901+05:30	\N	f
4	1	AuditLogs	t	t	t	t	2025-09-16 22:36:15.926901+05:30	\N	f
5	1	SystemSettings	t	t	t	t	2025-09-16 22:36:15.926901+05:30	\N	f
\.


--
-- Data for Name: Roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Roles" ("Id", "Name", "IsDeleted", "DeletedDate") FROM stdin;
4	CSP	f	\N
1	Master Admin	f	\N
2	Admin	f	\N
3	HO User	f	\N
\.


--
-- Data for Name: SecurityLogs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SecurityLogs" ("Id", "EventType", "Description", "UserId", "IpAddress", "UserAgent", "Timestamp") FROM stdin;
\.


--
-- Data for Name: States; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."States" ("Id", "Name", "CountryId", "IsDeleted", "DeletedDate") FROM stdin;
1	Andhra Pradesh	1	f	\N
2	Arunachal Pradesh	1	f	\N
3	Assam	1	f	\N
4	Bihar	1	f	\N
5	Chhattisgarh	1	f	\N
6	Goa	1	f	\N
7	Gujarat	1	f	\N
8	Haryana	1	f	\N
9	Himachal Pradesh	1	f	\N
10	Jharkhand	1	f	\N
11	Karnataka	1	f	\N
12	Kerala	1	f	\N
13	Madhya Pradesh	1	f	\N
14	Maharashtra	1	f	\N
15	Manipur	1	f	\N
16	Meghalaya	1	f	\N
17	Mizoram	1	f	\N
18	Nagaland	1	f	\N
19	Odisha	1	f	\N
20	Punjab	1	f	\N
21	Rajasthan	1	f	\N
22	Sikkim	1	f	\N
23	Tamil Nadu	1	f	\N
24	Telangana	1	f	\N
25	Tripura	1	f	\N
26	Uttar Pradesh	1	f	\N
27	Uttarakhand	1	f	\N
28	West Bengal	1	f	\N
29	Andaman and Nicobar Islands	1	f	\N
30	Chandigarh	1	f	\N
31	Dadra and Nagar Haveli and Daman and Diu	1	f	\N
32	Delhi	1	f	\N
33	Jammu and Kashmir	1	f	\N
34	Ladakh	1	f	\N
35	Lakshadweep	1	f	\N
36	Puducherry	1	f	\N
\.


--
-- Data for Name: Statuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Statuses" ("Id", "Name", "IsDeleted", "DeletedDate") FROM stdin;
\.


--
-- Data for Name: TechnicalDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TechnicalDetails" ("TicketId", "ProblemTypeId", "ResolutionProvidedByUserId", "AnyDeskDetail") FROM stdin;
bb3c8b1d-c385-4d33-8a42-1f0bfe76e4d8	2	\N	4512874512
0d8c057e-f704-4d70-8a7a-303a897b5bf7	\N	\N	4512874512
\.


--
-- Data for Name: TicketHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TicketHistory" ("HistoryId", "TicketId", "ChangeType", "OldValue", "NewValue", "ChangedByUserId", "ChangedDate") FROM stdin;
\.


--
-- Data for Name: TicketStatuses; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TicketStatuses" ("StatusId", "StatusName", "Description") FROM stdin;
1	New	Newly created ticket
2	In Progress	Ticket is being worked on
3	Pending	Waiting for user response
4	Under Review	Ticket is under review
5	Resolved	Issue has been resolved
6	Closed	Ticket is closed
7	Cancelled	Ticket was cancelled
\.


--
-- Data for Name: TicketTypes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TicketTypes" ("TypeId", "TypeName", "Description") FROM stdin;
1	Technical	Technical support issues
2	Withdrawal	Withdrawal requests
3	Deposit	Deposit related issues
4	Account	Account related queries
5	General	General inquiries
\.


--
-- Data for Name: Tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Tickets" ("TicketId", "TypeId", "RaisedByUserId", "RequesterEmail", "RequesterMobile", "Summary", "Description", "StatusId", "RequestedDate", "CompletionDate", "ResolutionDetail", "Comment", "CreatedByUserId", "CreatedDate", "UpdatedByUserId", "UpdatedDate", "IsDeleted", "DeletedDate", "Priority", "PriorityScore") FROM stdin;
550e8400-e29b-41d4-a716-446655440001	1	1	user@example.com	9876543210	Unable to access customer portal	Customer reports that they cannot log into the portal. Error message shows "Invalid credentials" even with correct password.	1	2025-09-16 21:59:21.079682+05:30	\N	\N	Initial ticket creation	1	2025-09-16 21:59:21.079682+05:30	\N	\N	f	\N	HIGH	75
550e8400-e29b-41d4-a716-446655440004	1	1	emergency@example.com	6543210987	URGENT: System down - Cannot access any services	Complete system outage. All services are down. Multiple customers affected. Need immediate attention.	3	2025-09-16 21:29:21.079682+05:30	\N	\N	Ticket resolved successfully	1	2025-09-16 21:29:21.079682+05:30	1	2025-09-16 22:00:51.909496+05:30	f	\N	URGENT	95
550e8400-e29b-41d4-a716-446655440003	3	1	depositor@example.com	7654321098	Deposit not reflected in account	Made a deposit of Rs. 25,000 via NEFT on 2025-09-13 but amount not showing in account balance.	5	2025-09-15 21:59:21.079682+05:30	2025-09-16 19:59:21.079682+05:30	Deposit was processed with 24-hour delay due to bank holiday. Amount now reflected in account.	Status changed to Resolved	1	2025-09-15 21:59:21.079682+05:30	1	2025-09-16 22:02:35.128295+05:30	f	\N	LOW	25
ffd65bc6-3700-4eee-832d-98f77d9947eb	2	1	diwesh.tanwar@gmail.com	9456088680	sdfgvbhn	cvfbcfvxvxvxc	1	2025-09-17 23:23:35.647096+05:30	\N	\N	\N	1	2025-09-17 23:23:35.647032+05:30	\N	\N	f	\N	MEDIUM	50
550e8400-e29b-41d4-a716-446655440002	2	1	customer@example.com	8765432109	Withdrawal request for Rs. 50,000	Customer requesting withdrawal of Rs. 50,000 to bank account ending in 1234.	5	2025-09-16 19:59:21.079682+05:30	\N		Status changed to Closed	1	2025-09-16 19:59:21.079682+05:30	1	2025-09-17 23:38:43.576729+05:30	f	\N	MEDIUM	60
b36f414f-c151-452b-ae77-02b537cea008	2	1	diwesh.tanwar@gmail.com	9456088680	sdfgvbhn	sss	1	2025-09-17 23:52:27.117121+05:30	\N	\N	\N	1	2025-09-17 23:52:27.117073+05:30	\N	\N	f	\N	MEDIUM	50
d3db0efe-b9fe-431a-b969-cd8cca5ff4f9	2	1	diwesh.tanwar@gmail.com	9456088680	sdfgvbhn	sss	1	2025-09-17 23:52:34.079906+05:30	\N	\N	\N	1	2025-09-17 23:52:34.079905+05:30	\N	\N	f	\N	MEDIUM	50
2acbeb46-313d-4b0b-96cf-4b6d85b8d038	2	1	diwesh.tanwar@gmail.com	9456088680	sdfgvbhn	sss	1	2025-09-17 23:52:35.609029+05:30	\N	\N	\N	1	2025-09-17 23:52:35.609029+05:30	\N	\N	f	\N	MEDIUM	50
bb3c8b1d-c385-4d33-8a42-1f0bfe76e4d8	1	1	diwesh.tanwar@gmail.com	9456088680	App Crashes on Launch After Latest Update	http://localhost:5174/#/login	1	2025-11-16 19:03:55.106535+05:30	\N	\N	\N	1	2025-11-16 19:03:55.106535+05:30	\N	\N	f	\N	MEDIUM	50
0d8c057e-f704-4d70-8a7a-303a897b5bf7	1	10	diwesh.tanwar@gmail.com	9456088680	New App Crashes on Launch After Latest Update	sample	1	2025-11-16 20:04:01.205592+05:30	\N	\N	\N	10	2025-11-16 20:04:01.205459+05:30	\N	\N	f	\N	MEDIUM	50
\.


--
-- Data for Name: TransactionAudits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransactionAudits" ("Id", "TicketId", "WalletTransactionId", "Action", "OldAmount", "NewAmount", "BalanceBefore", "BalanceAfter", "PerformedByUserId", "IpAddress", "UserAgent", "Reason", "RiskLevel", "CreatedDate") FROM stdin;
\.


--
-- Data for Name: UserDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserDetails" ("Id", "UserId", "Name", "Code", "BranchCode", "ExpiryDate", "BankName", "BankAccount", "IFSC", "CertificateStatus", "StatusId", "CountryId", "StateId", "CityId", "LocationId", "Category", "PAN", "VoterId", "AadharNo", "Education", "CreatedDate", "CreatedBy", "UpdatedDate", "UpdatedBy", "IsDeleted", "DeletedDate") FROM stdin;
1	10	\N	CSP1	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2025-11-16 19:21:18.112531+05:30	\N	\N	\N	f	\N
\.


--
-- Data for Name: UserDocuments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserDocuments" ("Id", "Code", "UserId", "DocumentType", "DocumentPath", "UploadedDate", "Description", "IsDeleted", "DeletedDate", "CreatedDate", "UpdatedDate") FROM stdin;
\.


--
-- Data for Name: UserLimits; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserLimits" ("Id", "UserId", "DailyWithdrawalLimit", "MonthlyWithdrawalLimit", "SingleTransactionLimit", "DailyTransactionCount", "MinimumBalance", "RequireApprovalAbove", "ApprovalThreshold", "CreatedDate", "UpdatedDate") FROM stdin;
\.


--
-- Data for Name: Users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Users" ("Id", "Username", "PasswordHash", "MobileNumber", "EmergencyContactNumber", "FatherName", "MotherName", "RoleId", "CreatedAt", "LastLoginAt", "UpdatedDate", "IsActive", "Email", "FullName", "FailedLoginAttempts", "IsLocked", "LockedUntil", "LastFailedLoginAt", "IsDeleted", "DeletedDate") FROM stdin;
1	masteradmin	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	\N	\N	\N	\N	1	2025-09-16 13:57:50.567277+05:30	2025-11-16 23:11:17.201629+05:30	2025-09-16 13:57:50.567277+05:30	t	admin@example.com	Master Admin	0	f	\N	\N	f	\N
7	jane_smith	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	0987654321	\N	Robert Smith	Mary Smith	4	2025-09-19 09:14:36.946658+05:30	2025-11-16 23:19:02.837122+05:30	2025-09-20 12:52:35.844936+05:30	t	jane@example.com	Jane Smith	0	f	\N	\N	f	\N
2	admin	$2a$11$cnt.H0QRmvc40iBJYXThRuzwK3ETERfMuj2P4c8sahEIvKpxT3IQS	9876543210	123456789	Admin Father	Admin Mother	2	2025-09-17 22:23:09.464319+05:30	2026-08-25 11:20:00.194877+05:30	\N	t	admin@gmail.com	Admin	0	f	\N	\N	f	\N
5	user_80e70cf2-4eb9-4099-989a-c1cd00793e58	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	945602285		CSP father	CSP Mother	4	2025-09-19 09:04:26.687907+05:30	\N	2025-09-20 11:02:46.169314+05:30	t	diwesh.tanwar@gmail.com	Diwesh Tanwar	0	f	\N	\N	t	2025-09-20 11:02:46.16921+05:30
3	user_3b759cfa-065a-49b3-a605-d8ed00abde20	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	9876543210		Admin Father	Admin Mother	2	2025-09-17 22:26:53.016863+05:30	\N	2025-09-20 11:21:01.519962+05:30	t	admin@gmail.com	Admin	0	f	\N	\N	t	2025-09-20 11:21:01.519962+05:30
4	user_a2287729-82cb-415e-9d7c-92b100f33358	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	9876543210		Admin Father	Admin Mother	2	2025-09-17 22:27:39.416187+05:30	\N	2025-09-20 11:21:07.672392+05:30	t	admin@gmail.com	Admin	0	f	\N	\N	t	2025-09-20 11:21:07.672391+05:30
8	user_e818cc1d-502f-4b8a-8f19-f3e3273fe1cc	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq					4	2025-09-19 09:36:10.647132+05:30	\N	2025-09-20 10:21:02.058364+05:30	t			0	f	\N	\N	t	2025-09-20 10:21:02.058294+05:30
9	user_4ac0e584-843a-45c8-86b0-93eec761a3dc	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq					4	2025-09-19 09:38:37.834498+05:30	\N	2025-09-20 10:21:05.94381+05:30	t			0	f	\N	\N	t	2025-09-20 10:21:05.94381+05:30
6	user_efc40612-5a68-476a-a7b9-6b1456262f4c	$2a$11$3./ivWivVKAxm3oxmx8sTuk9YnP8EFphSceid2oxP7UKy.9HpeAIq	945602285		CSP father	CSP Mother	4	2025-09-19 09:05:09.0554+05:30	\N	2025-11-16 19:34:18.503866+05:30	t	diwesh.tanwar@gmail.com	Diwesh Tanwar	0	f	\N	\N	f	\N
10	CSP1	$2a$11$CwyPaRJ.qn/TYIuW4H7mXub.VHIYD5e05dp6kK1LYWAgjvh4iiBwm	09456088680				4	2025-11-16 19:21:18.061056+05:30	2025-11-16 22:24:11.273211+05:30	\N	t	Diwesh.tanwar@gmail.com	Diwesh Tanwar	0	f	\N	\N	f	\N
11	HOUser	$2a$11$zi5iaQisYsxezcYGWNTTNeGJZxyaeIkxKnk4PluobJJi9LZHHFd8W	54125487		Father name	Mother Name	3	2025-11-16 22:18:38.242609+05:30	2025-11-16 22:32:24.102616+05:30	\N	t	diwesh.tanwar@gmail.com	Ho User	0	f	\N	\N	f	\N
\.


--
-- Data for Name: WalletTransactions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WalletTransactions" ("TransactionId", "WalletId", "TicketId", "TransactionType", "Amount", "BalanceAfter", "Description", "Status", "CreatedDate", "CreatedByUserId") FROM stdin;
01c7ece7-3c82-4bbe-9293-0b2b8f5a564e	46354874-6970-423d-b803-49c51f72193f	\N	ADJUSTMENT	2000.00	2000.00	Admin deposit: â‚¹2000	COMPLETED	2025-11-16 21:09:06.006991+05:30	1
1f0c7602-b71d-4c68-949c-e784b6db7c8b	f817c38d-a3bc-4aa6-afee-2910a5747ec8	\N	ADJUSTMENT	120000.00	120000.00	Admin deposit: â‚¹120000	COMPLETED	2025-11-16 21:10:16.91586+05:30	1
\.


--
-- Data for Name: Wallets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Wallets" ("WalletId", "UserId", "Balance", "PendingAmount", "IsActive", "CreatedDate", "UpdatedDate") FROM stdin;
46354874-6970-423d-b803-49c51f72193f	10	2000.00	0.00	t	2025-11-16 21:09:05.894725+05:30	2025-11-16 21:09:06.006763+05:30
f817c38d-a3bc-4aa6-afee-2910a5747ec8	1	120000.00	0.00	t	2025-09-18 11:05:35.487873+05:30	2025-11-16 21:10:16.915858+05:30
e4a23737-0bf3-4bb6-8974-7d44f81599a8	7	0.00	0.00	t	2025-11-16 21:42:41.327421+05:30	\N
\.


--
-- Data for Name: WithdrawalDetails; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WithdrawalDetails" ("TicketId", "Amount", "Account", "IsConfigured", "IsMake", "IsAuthorized", "AuthorizedAmount", "ApprovedAmount", "ApprovedByUserId", "ApprovedDate", "ApprovalComment") FROM stdin;
ffd65bc6-3700-4eee-832d-98f77d9947eb	500.00	8745122356	f	f	f	\N	\N	\N	\N	\N
b36f414f-c151-452b-ae77-02b537cea008	500.00	8745122356	f	f	f	\N	\N	\N	\N	\N
d3db0efe-b9fe-431a-b969-cd8cca5ff4f9	500.00	8745122356	f	f	f	\N	\N	\N	\N	\N
2acbeb46-313d-4b0b-96cf-4b6d85b8d038	500.00	8745122356	f	f	f	\N	\N	\N	\N	\N
\.


--
-- Data for Name: __EFMigrationsHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."__EFMigrationsHistory" ("MigrationId", "ProductVersion") FROM stdin;
20250916082204_InitialCleanMigration	9.0.8
20250920034926_SyncModelWithUserTables	9.0.8
20250920180000_AddPerformanceIndexes	9.0.8
20260824094417_SyncModelChanges	10.0.11
\.


--
-- Name: AuditLogs_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."AuditLogs_Id_seq"', 56, true);


--
-- Name: BroadcastReceipts_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."BroadcastReceipts_Id_seq"', 21, true);


--
-- Name: Broadcasts_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Broadcasts_Id_seq"', 6, true);


--
-- Name: ChatMessages_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ChatMessages_Id_seq"', 1, false);


--
-- Name: Cities_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Cities_Id_seq"', 72, true);


--
-- Name: CommissionDocuments_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."CommissionDocuments_Id_seq"', 1, false);


--
-- Name: Countries_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Countries_Id_seq"', 1, false);


--
-- Name: Departments_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Departments_Id_seq"', 1, false);


--
-- Name: Designations_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Designations_Id_seq"', 1, false);


--
-- Name: GeneralUserDetails_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GeneralUserDetails_Id_seq"', 4, true);


--
-- Name: GroupChatMembers_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GroupChatMembers_Id_seq"', 1, false);


--
-- Name: GroupChats_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."GroupChats_Id_seq"', 1, false);


--
-- Name: Locations_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Locations_Id_seq"', 1, false);


--
-- Name: Messages_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Messages_Id_seq"', 2, true);


--
-- Name: ProblemTypes_ProblemTypeId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ProblemTypes_ProblemTypeId_seq"', 5, true);


--
-- Name: ResourceAccesses_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ResourceAccesses_Id_seq"', 1, true);


--
-- Name: ResourceCategories_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."ResourceCategories_Id_seq"', 13, true);


--
-- Name: Resources_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Resources_Id_seq"', 1, true);


--
-- Name: RolePermissions_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."RolePermissions_Id_seq"', 5, true);


--
-- Name: Roles_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Roles_Id_seq"', 5, false);


--
-- Name: SecurityLogs_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."SecurityLogs_Id_seq"', 1, false);


--
-- Name: States_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."States_Id_seq"', 36, true);


--
-- Name: Statuses_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Statuses_Id_seq"', 1, false);


--
-- Name: TicketStatuses_StatusId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TicketStatuses_StatusId_seq"', 7, true);


--
-- Name: TicketTypes_TypeId_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."TicketTypes_TypeId_seq"', 5, true);


--
-- Name: UserDetails_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserDetails_Id_seq"', 1, true);


--
-- Name: UserDocuments_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserDocuments_Id_seq"', 1, false);


--
-- Name: UserLimits_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."UserLimits_Id_seq"', 1, false);


--
-- Name: Users_Id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public."Users_Id_seq"', 11, true);


--
-- Name: GroupChats AK_GroupChats_GroupId; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChats"
    ADD CONSTRAINT "AK_GroupChats_GroupId" UNIQUE ("GroupId");


--
-- Name: UserDetails AK_UserDetails_Code; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "AK_UserDetails_Code" UNIQUE ("Code");


--
-- Name: Attachments PK_Attachments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "PK_Attachments" PRIMARY KEY ("AttachmentId");


--
-- Name: AuditLogs PK_AuditLogs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "PK_AuditLogs" PRIMARY KEY ("Id");


--
-- Name: BroadcastReceipts PK_BroadcastReceipts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BroadcastReceipts"
    ADD CONSTRAINT "PK_BroadcastReceipts" PRIMARY KEY ("Id");


--
-- Name: Broadcasts PK_Broadcasts; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Broadcasts"
    ADD CONSTRAINT "PK_Broadcasts" PRIMARY KEY ("Id");


--
-- Name: ChatMessages PK_ChatMessages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "PK_ChatMessages" PRIMARY KEY ("Id");


--
-- Name: Cities PK_Cities; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cities"
    ADD CONSTRAINT "PK_Cities" PRIMARY KEY ("Id");


--
-- Name: CommissionBreakdowns PK_CommissionBreakdowns; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionBreakdowns"
    ADD CONSTRAINT "PK_CommissionBreakdowns" PRIMARY KEY ("Id");


--
-- Name: CommissionDocument PK_CommissionDocument; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionDocument"
    ADD CONSTRAINT "PK_CommissionDocument" PRIMARY KEY ("Id");


--
-- Name: CommissionDocuments PK_CommissionDocuments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionDocuments"
    ADD CONSTRAINT "PK_CommissionDocuments" PRIMARY KEY ("Id");


--
-- Name: Commissions PK_Commissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "PK_Commissions" PRIMARY KEY ("CommissionId");


--
-- Name: Countries PK_Countries; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Countries"
    ADD CONSTRAINT "PK_Countries" PRIMARY KEY ("Id");


--
-- Name: Departments PK_Departments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Departments"
    ADD CONSTRAINT "PK_Departments" PRIMARY KEY ("Id");


--
-- Name: DepositDetails PK_DepositDetails; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositDetails"
    ADD CONSTRAINT "PK_DepositDetails" PRIMARY KEY ("TicketId");


--
-- Name: Designations PK_Designations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Designations"
    ADD CONSTRAINT "PK_Designations" PRIMARY KEY ("Id");


--
-- Name: GeneralUserDetails PK_GeneralUserDetails; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "PK_GeneralUserDetails" PRIMARY KEY ("Id");


--
-- Name: GroupChatMembers PK_GroupChatMembers; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChatMembers"
    ADD CONSTRAINT "PK_GroupChatMembers" PRIMARY KEY ("Id");


--
-- Name: GroupChats PK_GroupChats; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChats"
    ADD CONSTRAINT "PK_GroupChats" PRIMARY KEY ("Id");


--
-- Name: Locations PK_Locations; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Locations"
    ADD CONSTRAINT "PK_Locations" PRIMARY KEY ("Id");


--
-- Name: Messages PK_Messages; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "PK_Messages" PRIMARY KEY ("Id");


--
-- Name: ProblemTypes PK_ProblemTypes; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ProblemTypes"
    ADD CONSTRAINT "PK_ProblemTypes" PRIMARY KEY ("ProblemTypeId");


--
-- Name: ResourceAccesses PK_ResourceAccesses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ResourceAccesses"
    ADD CONSTRAINT "PK_ResourceAccesses" PRIMARY KEY ("Id");


--
-- Name: ResourceCategories PK_ResourceCategories; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ResourceCategories"
    ADD CONSTRAINT "PK_ResourceCategories" PRIMARY KEY ("Id");


--
-- Name: Resources PK_Resources; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resources"
    ADD CONSTRAINT "PK_Resources" PRIMARY KEY ("Id");


--
-- Name: RolePermissions PK_RolePermissions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "PK_RolePermissions" PRIMARY KEY ("Id");


--
-- Name: Roles PK_Roles; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Roles"
    ADD CONSTRAINT "PK_Roles" PRIMARY KEY ("Id");


--
-- Name: SecurityLogs PK_SecurityLogs; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityLogs"
    ADD CONSTRAINT "PK_SecurityLogs" PRIMARY KEY ("Id");


--
-- Name: States PK_States; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."States"
    ADD CONSTRAINT "PK_States" PRIMARY KEY ("Id");


--
-- Name: Statuses PK_Statuses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Statuses"
    ADD CONSTRAINT "PK_Statuses" PRIMARY KEY ("Id");


--
-- Name: TechnicalDetails PK_TechnicalDetails; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TechnicalDetails"
    ADD CONSTRAINT "PK_TechnicalDetails" PRIMARY KEY ("TicketId");


--
-- Name: TicketHistory PK_TicketHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketHistory"
    ADD CONSTRAINT "PK_TicketHistory" PRIMARY KEY ("HistoryId");


--
-- Name: TicketStatuses PK_TicketStatuses; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketStatuses"
    ADD CONSTRAINT "PK_TicketStatuses" PRIMARY KEY ("StatusId");


--
-- Name: TicketTypes PK_TicketTypes; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketTypes"
    ADD CONSTRAINT "PK_TicketTypes" PRIMARY KEY ("TypeId");


--
-- Name: Tickets PK_Tickets; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "PK_Tickets" PRIMARY KEY ("TicketId");


--
-- Name: TransactionAudits PK_TransactionAudits; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionAudits"
    ADD CONSTRAINT "PK_TransactionAudits" PRIMARY KEY ("Id");


--
-- Name: UserDetails PK_UserDetails; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "PK_UserDetails" PRIMARY KEY ("Id");


--
-- Name: UserDocuments PK_UserDocuments; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDocuments"
    ADD CONSTRAINT "PK_UserDocuments" PRIMARY KEY ("Id");


--
-- Name: UserLimits PK_UserLimits; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserLimits"
    ADD CONSTRAINT "PK_UserLimits" PRIMARY KEY ("Id");


--
-- Name: Users PK_Users; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "PK_Users" PRIMARY KEY ("Id");


--
-- Name: WalletTransactions PK_WalletTransactions; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "PK_WalletTransactions" PRIMARY KEY ("TransactionId");


--
-- Name: Wallets PK_Wallets; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "PK_Wallets" PRIMARY KEY ("WalletId");


--
-- Name: WithdrawalDetails PK_WithdrawalDetails; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WithdrawalDetails"
    ADD CONSTRAINT "PK_WithdrawalDetails" PRIMARY KEY ("TicketId");


--
-- Name: __EFMigrationsHistory PK___EFMigrationsHistory; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."__EFMigrationsHistory"
    ADD CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId");


--
-- Name: IX_Attachments_TicketId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Attachments_TicketId" ON public."Attachments" USING btree ("TicketId");


--
-- Name: IX_Attachments_UploadedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Attachments_UploadedByUserId" ON public."Attachments" USING btree ("UploadedByUserId");


--
-- Name: IX_AuditLogs_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_AuditLogs_UserId" ON public."AuditLogs" USING btree ("UserId");


--
-- Name: IX_BroadcastReceipts_BroadcastId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_BroadcastReceipts_BroadcastId" ON public."BroadcastReceipts" USING btree ("BroadcastId");


--
-- Name: IX_BroadcastReceipts_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_BroadcastReceipts_UserId" ON public."BroadcastReceipts" USING btree ("UserId");


--
-- Name: IX_Broadcasts_SentByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Broadcasts_SentByUserId" ON public."Broadcasts" USING btree ("SentByUserId");


--
-- Name: IX_ChatMessages_FromUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_ChatMessages_FromUserId" ON public."ChatMessages" USING btree ("FromUserId");


--
-- Name: IX_ChatMessages_GroupChatId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_ChatMessages_GroupChatId" ON public."ChatMessages" USING btree ("GroupChatId");


--
-- Name: IX_ChatMessages_ToUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_ChatMessages_ToUserId" ON public."ChatMessages" USING btree ("ToUserId");


--
-- Name: IX_Cities_StateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Cities_StateId" ON public."Cities" USING btree ("StateId");


--
-- Name: IX_CommissionBreakdowns_CommissionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_CommissionBreakdowns_CommissionId" ON public."CommissionBreakdowns" USING btree ("CommissionId");


--
-- Name: IX_CommissionDocument_CommissionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_CommissionDocument_CommissionId" ON public."CommissionDocument" USING btree ("CommissionId");


--
-- Name: IX_CommissionDocument_UploadedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_CommissionDocument_UploadedByUserId" ON public."CommissionDocument" USING btree ("UploadedByUserId");


--
-- Name: IX_CommissionDocuments_CSPCode; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_CommissionDocuments_CSPCode" ON public."CommissionDocuments" USING btree ("CSPCode");


--
-- Name: IX_CommissionDocuments_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_CommissionDocuments_UserId" ON public."CommissionDocuments" USING btree ("UserId");


--
-- Name: IX_Commission_CSP_Month_Year; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Commission_CSP_Month_Year" ON public."Commissions" USING btree ("CSPUserId", "Month", "Year");


--
-- Name: IX_Commissions_ApprovedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Commissions_ApprovedByUserId" ON public."Commissions" USING btree ("ApprovedByUserId");


--
-- Name: IX_Commissions_CreatedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Commissions_CreatedByUserId" ON public."Commissions" USING btree ("CreatedByUserId");


--
-- Name: IX_Countries_Name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Countries_Name" ON public."Countries" USING btree ("Name");


--
-- Name: IX_Departments_Name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Departments_Name" ON public."Departments" USING btree ("Name");


--
-- Name: IX_DepositDetails_ApprovedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_DepositDetails_ApprovedByUserId" ON public."DepositDetails" USING btree ("ApprovedByUserId");


--
-- Name: IX_Designations_DepartmentId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Designations_DepartmentId" ON public."Designations" USING btree ("DepartmentId");


--
-- Name: IX_GeneralUserDetails_CityId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GeneralUserDetails_CityId" ON public."GeneralUserDetails" USING btree ("CityId");


--
-- Name: IX_GeneralUserDetails_DepartmentId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GeneralUserDetails_DepartmentId" ON public."GeneralUserDetails" USING btree ("DepartmentId");


--
-- Name: IX_GeneralUserDetails_DesignationId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GeneralUserDetails_DesignationId" ON public."GeneralUserDetails" USING btree ("DesignationId");


--
-- Name: IX_GeneralUserDetails_StateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GeneralUserDetails_StateId" ON public."GeneralUserDetails" USING btree ("StateId");


--
-- Name: IX_GeneralUserDetails_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_GeneralUserDetails_UserId" ON public."GeneralUserDetails" USING btree ("UserId");


--
-- Name: IX_GroupChatMembers_GroupId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GroupChatMembers_GroupId" ON public."GroupChatMembers" USING btree ("GroupId");


--
-- Name: IX_GroupChatMembers_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GroupChatMembers_UserId" ON public."GroupChatMembers" USING btree ("UserId");


--
-- Name: IX_GroupChats_CreatedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_GroupChats_CreatedByUserId" ON public."GroupChats" USING btree ("CreatedByUserId");


--
-- Name: IX_Locations_CityId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Locations_CityId" ON public."Locations" USING btree ("CityId");


--
-- Name: IX_Messages_FromUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Messages_FromUserId" ON public."Messages" USING btree ("FromUserId");


--
-- Name: IX_Messages_ToUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Messages_ToUserId" ON public."Messages" USING btree ("ToUserId");


--
-- Name: IX_ResourceAccesses_ResourceId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_ResourceAccesses_ResourceId" ON public."ResourceAccesses" USING btree ("ResourceId");


--
-- Name: IX_ResourceAccesses_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_ResourceAccesses_UserId" ON public."ResourceAccesses" USING btree ("UserId");


--
-- Name: IX_Resources_CategoryId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Resources_CategoryId" ON public."Resources" USING btree ("CategoryId");


--
-- Name: IX_Resources_UploadedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Resources_UploadedByUserId" ON public."Resources" USING btree ("UploadedByUserId");


--
-- Name: IX_RolePermissions_RoleId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_RolePermissions_RoleId" ON public."RolePermissions" USING btree ("RoleId");


--
-- Name: IX_Roles_Name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Roles_Name" ON public."Roles" USING btree ("Name");


--
-- Name: IX_SecurityLogs_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_SecurityLogs_UserId" ON public."SecurityLogs" USING btree ("UserId");


--
-- Name: IX_States_CountryId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_States_CountryId" ON public."States" USING btree ("CountryId");


--
-- Name: IX_Statuses_Name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_Statuses_Name" ON public."Statuses" USING btree ("Name");


--
-- Name: IX_TechnicalDetails_ProblemTypeId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TechnicalDetails_ProblemTypeId" ON public."TechnicalDetails" USING btree ("ProblemTypeId");


--
-- Name: IX_TechnicalDetails_ResolutionProvidedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TechnicalDetails_ResolutionProvidedByUserId" ON public."TechnicalDetails" USING btree ("ResolutionProvidedByUserId");


--
-- Name: IX_TicketHistory_ChangedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TicketHistory_ChangedByUserId" ON public."TicketHistory" USING btree ("ChangedByUserId");


--
-- Name: IX_TicketHistory_TicketId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TicketHistory_TicketId" ON public."TicketHistory" USING btree ("TicketId");


--
-- Name: IX_Tickets_CreatedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_CreatedByUserId" ON public."Tickets" USING btree ("CreatedByUserId");


--
-- Name: IX_Tickets_CreatedDate; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_CreatedDate" ON public."Tickets" USING btree ("CreatedDate");


--
-- Name: IX_Tickets_RaisedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_RaisedByUserId" ON public."Tickets" USING btree ("RaisedByUserId");


--
-- Name: IX_Tickets_StatusId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_StatusId" ON public."Tickets" USING btree ("StatusId");


--
-- Name: IX_Tickets_Type_Status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_Type_Status" ON public."Tickets" USING btree ("TypeId", "StatusId");


--
-- Name: IX_Tickets_UpdatedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Tickets_UpdatedByUserId" ON public."Tickets" USING btree ("UpdatedByUserId");


--
-- Name: IX_TransactionAudits_PerformedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TransactionAudits_PerformedByUserId" ON public."TransactionAudits" USING btree ("PerformedByUserId");


--
-- Name: IX_TransactionAudits_TicketId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TransactionAudits_TicketId" ON public."TransactionAudits" USING btree ("TicketId");


--
-- Name: IX_TransactionAudits_WalletTransactionId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_TransactionAudits_WalletTransactionId" ON public."TransactionAudits" USING btree ("WalletTransactionId");


--
-- Name: IX_UserDetails_CityId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDetails_CityId" ON public."UserDetails" USING btree ("CityId");


--
-- Name: IX_UserDetails_CountryId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDetails_CountryId" ON public."UserDetails" USING btree ("CountryId");


--
-- Name: IX_UserDetails_LocationId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDetails_LocationId" ON public."UserDetails" USING btree ("LocationId");


--
-- Name: IX_UserDetails_StateId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDetails_StateId" ON public."UserDetails" USING btree ("StateId");


--
-- Name: IX_UserDetails_StatusId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDetails_StatusId" ON public."UserDetails" USING btree ("StatusId");


--
-- Name: IX_UserDetails_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "IX_UserDetails_UserId" ON public."UserDetails" USING btree ("UserId");


--
-- Name: IX_UserDocuments_Code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDocuments_Code" ON public."UserDocuments" USING btree ("Code");


--
-- Name: IX_UserDocuments_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserDocuments_UserId" ON public."UserDocuments" USING btree ("UserId");


--
-- Name: IX_UserLimits_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_UserLimits_UserId" ON public."UserLimits" USING btree ("UserId");


--
-- Name: IX_Users_RoleId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Users_RoleId" ON public."Users" USING btree ("RoleId");


--
-- Name: IX_WalletTransactions_CreatedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_WalletTransactions_CreatedByUserId" ON public."WalletTransactions" USING btree ("CreatedByUserId");


--
-- Name: IX_WalletTransactions_TicketId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_WalletTransactions_TicketId" ON public."WalletTransactions" USING btree ("TicketId");


--
-- Name: IX_WalletTransactions_WalletId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_WalletTransactions_WalletId" ON public."WalletTransactions" USING btree ("WalletId");


--
-- Name: IX_Wallets_UserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_Wallets_UserId" ON public."Wallets" USING btree ("UserId");


--
-- Name: IX_WithdrawalDetails_ApprovedByUserId; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "IX_WithdrawalDetails_ApprovedByUserId" ON public."WithdrawalDetails" USING btree ("ApprovedByUserId");


--
-- Name: idx_commissions_cspuserid_year_month; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_commissions_cspuserid_year_month ON public."Commissions" USING btree ("CSPUserId", "Year", "Month");


--
-- Name: idx_generaluserdetails_userid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_generaluserdetails_userid ON public."GeneralUserDetails" USING btree ("UserId");


--
-- Name: idx_tickets_statusid_isdeleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tickets_statusid_isdeleted ON public."Tickets" USING btree ("StatusId", "IsDeleted");


--
-- Name: idx_userdetails_userid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_userdetails_userid ON public."UserDetails" USING btree ("UserId");


--
-- Name: idx_userdocuments_code; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_userdocuments_code ON public."UserDocuments" USING btree ("Code");


--
-- Name: idx_users_email_isdeleted; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_email_isdeleted ON public."Users" USING btree ("Email", "IsDeleted");


--
-- Name: idx_users_roleid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_roleid ON public."Users" USING btree ("RoleId");


--
-- Name: idx_wallets_userid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wallets_userid ON public."Wallets" USING btree ("UserId");


--
-- Name: Attachments FK_Attachments_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "FK_Attachments_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE CASCADE;


--
-- Name: Attachments FK_Attachments_Users_UploadedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Attachments"
    ADD CONSTRAINT "FK_Attachments_Users_UploadedByUserId" FOREIGN KEY ("UploadedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: AuditLogs FK_AuditLogs_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."AuditLogs"
    ADD CONSTRAINT "FK_AuditLogs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: BroadcastReceipts FK_BroadcastReceipts_Broadcasts_BroadcastId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BroadcastReceipts"
    ADD CONSTRAINT "FK_BroadcastReceipts_Broadcasts_BroadcastId" FOREIGN KEY ("BroadcastId") REFERENCES public."Broadcasts"("Id") ON DELETE CASCADE;


--
-- Name: BroadcastReceipts FK_BroadcastReceipts_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."BroadcastReceipts"
    ADD CONSTRAINT "FK_BroadcastReceipts_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Broadcasts FK_Broadcasts_Users_SentByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Broadcasts"
    ADD CONSTRAINT "FK_Broadcasts_Users_SentByUserId" FOREIGN KEY ("SentByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: ChatMessages FK_ChatMessages_GroupChats_GroupChatId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "FK_ChatMessages_GroupChats_GroupChatId" FOREIGN KEY ("GroupChatId") REFERENCES public."GroupChats"("Id");


--
-- Name: ChatMessages FK_ChatMessages_Users_FromUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "FK_ChatMessages_Users_FromUserId" FOREIGN KEY ("FromUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: ChatMessages FK_ChatMessages_Users_ToUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ChatMessages"
    ADD CONSTRAINT "FK_ChatMessages_Users_ToUserId" FOREIGN KEY ("ToUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Cities FK_Cities_States_StateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Cities"
    ADD CONSTRAINT "FK_Cities_States_StateId" FOREIGN KEY ("StateId") REFERENCES public."States"("Id") ON DELETE RESTRICT;


--
-- Name: CommissionBreakdowns FK_CommissionBreakdowns_Commissions_CommissionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionBreakdowns"
    ADD CONSTRAINT "FK_CommissionBreakdowns_Commissions_CommissionId" FOREIGN KEY ("CommissionId") REFERENCES public."Commissions"("CommissionId") ON DELETE CASCADE;


--
-- Name: CommissionDocument FK_CommissionDocument_Commissions_CommissionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionDocument"
    ADD CONSTRAINT "FK_CommissionDocument_Commissions_CommissionId" FOREIGN KEY ("CommissionId") REFERENCES public."Commissions"("CommissionId") ON DELETE CASCADE;


--
-- Name: CommissionDocument FK_CommissionDocument_Users_UploadedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionDocument"
    ADD CONSTRAINT "FK_CommissionDocument_Users_UploadedByUserId" FOREIGN KEY ("UploadedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: CommissionDocuments FK_CommissionDocuments_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CommissionDocuments"
    ADD CONSTRAINT "FK_CommissionDocuments_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Commissions FK_Commissions_Users_ApprovedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "FK_Commissions_Users_ApprovedByUserId" FOREIGN KEY ("ApprovedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Commissions FK_Commissions_Users_CSPUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "FK_Commissions_Users_CSPUserId" FOREIGN KEY ("CSPUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Commissions FK_Commissions_Users_CreatedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Commissions"
    ADD CONSTRAINT "FK_Commissions_Users_CreatedByUserId" FOREIGN KEY ("CreatedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: DepositDetails FK_DepositDetails_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositDetails"
    ADD CONSTRAINT "FK_DepositDetails_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE CASCADE;


--
-- Name: DepositDetails FK_DepositDetails_Users_ApprovedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."DepositDetails"
    ADD CONSTRAINT "FK_DepositDetails_Users_ApprovedByUserId" FOREIGN KEY ("ApprovedByUserId") REFERENCES public."Users"("Id");


--
-- Name: Designations FK_Designations_Departments_DepartmentId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Designations"
    ADD CONSTRAINT "FK_Designations_Departments_DepartmentId" FOREIGN KEY ("DepartmentId") REFERENCES public."Departments"("Id") ON DELETE RESTRICT;


--
-- Name: GeneralUserDetails FK_GeneralUserDetails_Cities_CityId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "FK_GeneralUserDetails_Cities_CityId" FOREIGN KEY ("CityId") REFERENCES public."Cities"("Id") ON DELETE RESTRICT;


--
-- Name: GeneralUserDetails FK_GeneralUserDetails_Departments_DepartmentId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "FK_GeneralUserDetails_Departments_DepartmentId" FOREIGN KEY ("DepartmentId") REFERENCES public."Departments"("Id") ON DELETE RESTRICT;


--
-- Name: GeneralUserDetails FK_GeneralUserDetails_Designations_DesignationId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "FK_GeneralUserDetails_Designations_DesignationId" FOREIGN KEY ("DesignationId") REFERENCES public."Designations"("Id") ON DELETE RESTRICT;


--
-- Name: GeneralUserDetails FK_GeneralUserDetails_States_StateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "FK_GeneralUserDetails_States_StateId" FOREIGN KEY ("StateId") REFERENCES public."States"("Id") ON DELETE RESTRICT;


--
-- Name: GeneralUserDetails FK_GeneralUserDetails_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GeneralUserDetails"
    ADD CONSTRAINT "FK_GeneralUserDetails_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: GroupChatMembers FK_GroupChatMembers_GroupChats_GroupId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChatMembers"
    ADD CONSTRAINT "FK_GroupChatMembers_GroupChats_GroupId" FOREIGN KEY ("GroupId") REFERENCES public."GroupChats"("GroupId") ON DELETE CASCADE;


--
-- Name: GroupChatMembers FK_GroupChatMembers_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChatMembers"
    ADD CONSTRAINT "FK_GroupChatMembers_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: GroupChats FK_GroupChats_Users_CreatedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."GroupChats"
    ADD CONSTRAINT "FK_GroupChats_Users_CreatedByUserId" FOREIGN KEY ("CreatedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Locations FK_Locations_Cities_CityId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Locations"
    ADD CONSTRAINT "FK_Locations_Cities_CityId" FOREIGN KEY ("CityId") REFERENCES public."Cities"("Id") ON DELETE RESTRICT;


--
-- Name: Messages FK_Messages_Users_FromUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Users_FromUserId" FOREIGN KEY ("FromUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Messages FK_Messages_Users_ToUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Messages"
    ADD CONSTRAINT "FK_Messages_Users_ToUserId" FOREIGN KEY ("ToUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: ResourceAccesses FK_ResourceAccesses_Resources_ResourceId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ResourceAccesses"
    ADD CONSTRAINT "FK_ResourceAccesses_Resources_ResourceId" FOREIGN KEY ("ResourceId") REFERENCES public."Resources"("Id") ON DELETE CASCADE;


--
-- Name: ResourceAccesses FK_ResourceAccesses_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ResourceAccesses"
    ADD CONSTRAINT "FK_ResourceAccesses_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Resources FK_Resources_ResourceCategories_CategoryId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resources"
    ADD CONSTRAINT "FK_Resources_ResourceCategories_CategoryId" FOREIGN KEY ("CategoryId") REFERENCES public."ResourceCategories"("Id") ON DELETE RESTRICT;


--
-- Name: Resources FK_Resources_Users_UploadedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Resources"
    ADD CONSTRAINT "FK_Resources_Users_UploadedByUserId" FOREIGN KEY ("UploadedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: RolePermissions FK_RolePermissions_Roles_RoleId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RolePermissions"
    ADD CONSTRAINT "FK_RolePermissions_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES public."Roles"("Id") ON DELETE RESTRICT;


--
-- Name: SecurityLogs FK_SecurityLogs_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."SecurityLogs"
    ADD CONSTRAINT "FK_SecurityLogs_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: States FK_States_Countries_CountryId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."States"
    ADD CONSTRAINT "FK_States_Countries_CountryId" FOREIGN KEY ("CountryId") REFERENCES public."Countries"("Id") ON DELETE RESTRICT;


--
-- Name: TechnicalDetails FK_TechnicalDetails_ProblemTypes_ProblemTypeId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TechnicalDetails"
    ADD CONSTRAINT "FK_TechnicalDetails_ProblemTypes_ProblemTypeId" FOREIGN KEY ("ProblemTypeId") REFERENCES public."ProblemTypes"("ProblemTypeId") ON DELETE RESTRICT;


--
-- Name: TechnicalDetails FK_TechnicalDetails_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TechnicalDetails"
    ADD CONSTRAINT "FK_TechnicalDetails_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE CASCADE;


--
-- Name: TechnicalDetails FK_TechnicalDetails_Users_ResolutionProvidedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TechnicalDetails"
    ADD CONSTRAINT "FK_TechnicalDetails_Users_ResolutionProvidedByUserId" FOREIGN KEY ("ResolutionProvidedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: TicketHistory FK_TicketHistory_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketHistory"
    ADD CONSTRAINT "FK_TicketHistory_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE CASCADE;


--
-- Name: TicketHistory FK_TicketHistory_Users_ChangedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TicketHistory"
    ADD CONSTRAINT "FK_TicketHistory_Users_ChangedByUserId" FOREIGN KEY ("ChangedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Tickets FK_Tickets_TicketStatuses_StatusId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "FK_Tickets_TicketStatuses_StatusId" FOREIGN KEY ("StatusId") REFERENCES public."TicketStatuses"("StatusId") ON DELETE RESTRICT;


--
-- Name: Tickets FK_Tickets_TicketTypes_TypeId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "FK_Tickets_TicketTypes_TypeId" FOREIGN KEY ("TypeId") REFERENCES public."TicketTypes"("TypeId") ON DELETE RESTRICT;


--
-- Name: Tickets FK_Tickets_Users_CreatedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "FK_Tickets_Users_CreatedByUserId" FOREIGN KEY ("CreatedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Tickets FK_Tickets_Users_RaisedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "FK_Tickets_Users_RaisedByUserId" FOREIGN KEY ("RaisedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: Tickets FK_Tickets_Users_UpdatedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Tickets"
    ADD CONSTRAINT "FK_Tickets_Users_UpdatedByUserId" FOREIGN KEY ("UpdatedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: TransactionAudits FK_TransactionAudits_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionAudits"
    ADD CONSTRAINT "FK_TransactionAudits_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE RESTRICT;


--
-- Name: TransactionAudits FK_TransactionAudits_Users_PerformedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionAudits"
    ADD CONSTRAINT "FK_TransactionAudits_Users_PerformedByUserId" FOREIGN KEY ("PerformedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: TransactionAudits FK_TransactionAudits_WalletTransactions_WalletTransactionId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransactionAudits"
    ADD CONSTRAINT "FK_TransactionAudits_WalletTransactions_WalletTransactionId" FOREIGN KEY ("WalletTransactionId") REFERENCES public."WalletTransactions"("TransactionId") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_Cities_CityId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_Cities_CityId" FOREIGN KEY ("CityId") REFERENCES public."Cities"("Id") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_Countries_CountryId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_Countries_CountryId" FOREIGN KEY ("CountryId") REFERENCES public."Countries"("Id") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_Locations_LocationId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_Locations_LocationId" FOREIGN KEY ("LocationId") REFERENCES public."Locations"("Id") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_States_StateId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_States_StateId" FOREIGN KEY ("StateId") REFERENCES public."States"("Id") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_Statuses_StatusId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_Statuses_StatusId" FOREIGN KEY ("StatusId") REFERENCES public."Statuses"("Id") ON DELETE RESTRICT;


--
-- Name: UserDetails FK_UserDetails_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDetails"
    ADD CONSTRAINT "FK_UserDetails_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: UserDocuments FK_UserDocuments_UserDetails_Code; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDocuments"
    ADD CONSTRAINT "FK_UserDocuments_UserDetails_Code" FOREIGN KEY ("Code") REFERENCES public."UserDetails"("Code") ON DELETE CASCADE;


--
-- Name: UserDocuments FK_UserDocuments_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserDocuments"
    ADD CONSTRAINT "FK_UserDocuments_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: UserLimits FK_UserLimits_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserLimits"
    ADD CONSTRAINT "FK_UserLimits_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE CASCADE;


--
-- Name: Users FK_Users_Roles_RoleId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "FK_Users_Roles_RoleId" FOREIGN KEY ("RoleId") REFERENCES public."Roles"("Id") ON DELETE RESTRICT;


--
-- Name: WalletTransactions FK_WalletTransactions_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "FK_WalletTransactions_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE RESTRICT;


--
-- Name: WalletTransactions FK_WalletTransactions_Users_CreatedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "FK_WalletTransactions_Users_CreatedByUserId" FOREIGN KEY ("CreatedByUserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: WalletTransactions FK_WalletTransactions_Wallets_WalletId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WalletTransactions"
    ADD CONSTRAINT "FK_WalletTransactions_Wallets_WalletId" FOREIGN KEY ("WalletId") REFERENCES public."Wallets"("WalletId") ON DELETE CASCADE;


--
-- Name: Wallets FK_Wallets_Users_UserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Wallets"
    ADD CONSTRAINT "FK_Wallets_Users_UserId" FOREIGN KEY ("UserId") REFERENCES public."Users"("Id") ON DELETE RESTRICT;


--
-- Name: WithdrawalDetails FK_WithdrawalDetails_Tickets_TicketId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WithdrawalDetails"
    ADD CONSTRAINT "FK_WithdrawalDetails_Tickets_TicketId" FOREIGN KEY ("TicketId") REFERENCES public."Tickets"("TicketId") ON DELETE CASCADE;


--
-- Name: WithdrawalDetails FK_WithdrawalDetails_Users_ApprovedByUserId; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WithdrawalDetails"
    ADD CONSTRAINT "FK_WithdrawalDetails_Users_ApprovedByUserId" FOREIGN KEY ("ApprovedByUserId") REFERENCES public."Users"("Id");


--
-- PostgreSQL database dump complete
--

\unrestrict WjKOYzT2UxMJLdu63DMdZPIDblO1HJ6TRtDcw60aVjS8BWk8O8eNKNA2W36FDmc

