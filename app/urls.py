from django.urls import path
from .views.user_views import UserProfileView, UserLoginView, verify_supabase_token, TokenRefreshView, LogoutView
from .views.organization_views import OrganizationView, InviteUserToOrganization, AcceptInviteView, OrganizationBySlugView, GenerateNewAPIKey
from .views.lead_views import LeadCreateView, LeadAssignmentView, LeadHistoryView
from .views.tag_views import TagView

urlpatterns = [
    # User Endpoints
    path("user/<str:supabase_uid>/", UserProfileView.as_view(), name="user-profile-detail"),
    path("user/", UserProfileView.as_view(), name="user-profile-create"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("verify-token/", verify_supabase_token, name="verify-token"),
    path('token-refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    
    # Organization Endpoints
    path("organization/", OrganizationView.as_view(), name="organization-create"),
    path("<uuid:org_id>/invite/", InviteUserToOrganization.as_view(), name="invite-user"),
    path("accept-invite/", AcceptInviteView.as_view(), name="accept-invite"),
    path("<str:slug>/", OrganizationBySlugView.as_view(), name="organization-by-slug"),
    path("<str:slug>/generate-api-key/", GenerateNewAPIKey.as_view(), name="generate-api-key"),
    
    # Lead Endpoints
    path('org/leads/', LeadCreateView.as_view(), name='create-lead'),
    path('leads/assignment/<uuid:lead_id>/', LeadAssignmentView.as_view(), name='lead-assignment'), 
    path('org/<str:slug>/leads/', LeadCreateView.as_view(), name='organization-leads'),
    path('org/<slug:slug>/lead-history/', LeadHistoryView.as_view(), name='lead-history'),
    # GET /org/org-a-slug/lead-history/

    # Tag Endpoints
    path("<str:slug>/tags/", TagView.as_view(), name="tag-list"),
]
