from django.urls import path
from .views.user_views import UserProfileView, UserLoginView, verify_supabase_token, TokenRefreshView
from .views.organization_views import OrganizationView, InviteUserToOrganization, AcceptInviteView, OrganizationBySlugView
from .views.lead_views import LeadCreateView, LeadAssignmentView
from .views.tag_views import TagView

urlpatterns = [
    # User Endpoints
    path("user/<str:supabase_uid>/", UserProfileView.as_view(), name="user-profile-detail"),
    path("user/", UserProfileView.as_view(), name="user-profile-create"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("verify-token/", verify_supabase_token, name="verify-token"),
    path('user/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    
    # Organization Endpoints
    path("organization/", OrganizationView.as_view(), name="organization-create"),
    path("<uuid:org_id>/invite/", InviteUserToOrganization.as_view(), name="invite-user"),
    path("invite/accept/<uuid:invite_id>/", AcceptInviteView.as_view(), name="accept-invite"),
    path("<str:slug>/", OrganizationBySlugView.as_view(), name="organization-by-slug"),

    # Lead Endpoints
    path('leads/', LeadCreateView.as_view(), name='create-lead'),
    path('leads/assignment/<uuid:lead_id>/', LeadAssignmentView.as_view(), name='lead-assignment'),  # Updated endpoint

    # Tag Endpoints
    path("<str:slug>/tags/", TagView.as_view(), name="tag-list"),
]
