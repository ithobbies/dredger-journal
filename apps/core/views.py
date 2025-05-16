from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        groups = list(user.groups.values_list("name", flat=True))
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "roles": groups,          # ["Администратор"] и т.п.
        })
