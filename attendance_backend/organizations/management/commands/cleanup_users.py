from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from organizations.models import Organization

User = get_user_model()

class Command(BaseCommand):
    help = 'Clean up users without proper organization assignment'

    def handle(self, *args, **options):
        # Delete users without organization (these are likely test data)
        users_without_org = User.objects.filter(organization__isnull=True)
        count = users_without_org.count()
        
        if count > 0:
            self.stdout.write(f'Found {count} users without organization assignment')
            users_without_org.delete()
            self.stdout.write(self.style.SUCCESS(f'Deleted {count} users without organization'))
        else:
            self.stdout.write('No users without organization found')
        
        # Show remaining users grouped by organization
        organizations = Organization.objects.all()
        for org in organizations:
            users = User.objects.filter(organization=org)
            self.stdout.write(f'\n{org.name}:')
            for user in users:
                self.stdout.write(f'  - {user.username} ({user.role})')
        
        self.stdout.write(self.style.SUCCESS('\nCleanup completed!'))