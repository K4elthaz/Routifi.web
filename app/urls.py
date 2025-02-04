from django.urls import path
from .views.user_views import UserProfileView, UserLoginView, verify_supabase_token
from .views.organization_views import OrganizationView, InviteUserToOrganization, AcceptInviteView
from .views.lead_views import LeadView, LeadDecisionView
from .views.tag_views import TagView

urlpatterns = [
    # User Endpoints
    path("user/<str:supabase_uid>/", UserProfileView.as_view(), name="user-profile-detail"),
    path("user/", UserProfileView.as_view(), name="user-profile-create"),
    path("login/", UserLoginView.as_view(), name="user-login"),
    path("verify-token/", verify_supabase_token, name="verify-token"),
    
    # Organization Endpoints
    path("organization/", OrganizationView.as_view(), name="organization-create"),  # ✅ For creating an org (POST)
    path("<str:slug>/", OrganizationView.as_view(), name="organization-detail"),  # ✅ For retrieving an org (GET)
    path("<str:slug>/invite/", InviteUserToOrganization.as_view(), name="invite-user"),
    path("invite/accept/<uuid:invite_id>/", AcceptInviteView.as_view(), name="accept-invite"),

    # Lead Endpoints
    path("<str:slug>/leads/", LeadView.as_view(), name="lead-list"),

    path('lead/<int:lead_id>/accept/<str:token>/', LeadDecisionView.as_view(), name='lead-decision'),
    path('leads/<slug:slug>/', LeadView.as_view(), name='create-lead'),
    
    # Tag Endpoints
    path("<str:slug>/tags/", TagView.as_view(), name="tag-list"),  # Corrected URL
]
