from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    # Optional fields added after user creation.
    bio = models.TextField(blank=True, null=True)
    avatar = models.URLField(max_length=500,blank=True, null=True)

class Event(models.Model):   
    
    title = models.CharField(max_length=64)
    description = models.TextField()

    # Necessary distinction between time and date.
    date = models.DateField()
    time = models.TimeField()

    # optional location
    address = models.CharField(max_length=100, blank=True, null=True)  

    # Host may edit the event.
    # Every host is also a participant (inforced in views.py).
    host = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_events")

    # Participants can only view it.
    participants = models.ManyToManyField(User, related_name="events")

    def serialize(self):
        # participants is a list of strings where each string is a username and id separated by a comma and a space.
        participants = []
        for p in self.participants.all():
            if p.id != self.host.id:
                participants.append(p.username + ', ' + str(p.id))
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "date": self.date.strftime("%b %-d %Y"),
            "time": self.time.strftime("%H:%M"),
            "host": [self.host.username, self.host.id], # [username, id]
            "participants": participants,
            "address"     : self.address
        }



    # Order by date ASC
    class Meta:
        ordering = ['date']
