from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from organizations.models import Organization

class Command(BaseCommand):
    help = 'Assign all employees with no organization to a specific organization.'

    def add_arguments(self, parser):
        parser.add_argument('organization_id', type=int, help='ID of the organization to assign employees to')

    def handle(self, *args, **options):
        User = get_user_model()
        org_id = options['organization_id']
        try:
            org = Organization.objects.get(id=org_id)
        except Organization.DoesNotExist:
            self.stdout.write(self.style.ERROR(f'Organization with id {org_id} does not exist.'))
            return
        employees = User.objects.filter(role='employee', organization__isnull=True)
        count = employees.update(organization=org)
        self.stdout.write(self.style.SUCCESS(f'Assigned {count} employees to organization: {org.name} (id={org.id})'))
