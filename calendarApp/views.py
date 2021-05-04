from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from django.forms import ModelForm, Textarea, TimeField, TimeInput, DateField, HiddenInput, CharField
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.http import JsonResponse
import json
import datetime
import requests
from django.core.cache import cache, InvalidCacheBackendError

from .models import User, Event

# Event Form
class EventForm(ModelForm):
    # The date field will be known already.
    class Meta:
        model = Event
        fields = ['title', 'description', 'address', 'time']
        widgets = {
          'description': Textarea(attrs={'rows':4, 'cols':15}),
        }

# GET Project README and render it as html using Github's API.
# Cache requests for 15 minutes.
def index(request):
    # Try getting content from cache
    try: 
        content = cache.get('content')
        if content is None:
            raise InvalidCacheBackendError
        return render(request, "calendarApp/index.html", {
        "title" : "Home",
        "cover" : True,
        "content": content
    })
    # If content not in cache, make requests
    except InvalidCacheBackendError:
        # README GET url.
        GIST_URL = "https://api.github.com/gists/b9b41463dd24641adb782f5abf70f426"

        
        # sending get request and saving the response as response object
        r = requests.get(url = GIST_URL)

        # extracting data in json format
        data = r.json()
        markdown = data['files']['CalendarApp.md']['content']

        # Transform markdown to html.

        # data to be posted
        data = { 'text' : markdown }
    
        POST_URL = 'https://api.github.com/markdown'

        # sending post request and saving its response text
        html = requests.post(url = POST_URL, json= data).text

        # cache result for 15 minutes
        cache.set('content', html, 60*15)
        
        return render(request, "calendarApp/index.html", {
            "title" : "Home",
            "cover" : True,
            "content": html
        })

#    #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #  #   #   #   #

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "calendarApp/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "calendarApp/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "calendarApp/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "calendarApp/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "calendarApp/register.html")

#    #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #   #  #   #   #   #

# A helper function to get user names from CSV string.
def get_participants(participants):
    names = [name.strip() for name in participants.split(",")]

    tmp_participants = []
    if names[0] != '':
        for name in names:
            try:
                user = User.objects.get(username=name)
                tmp_participants.append(user)
            except User.DoesNotExist:
                raise Exception(f"User with name '{name}' does not exist.")

    return tmp_participants

# GET -> Render Event Form with date given by url parameters.
#       If no date was passed, the rendered date will be today's date.
# POST -> Validate form and participants field. 
#       If either one is invalid, display error messages.
@login_required(login_url='login')
def create_event(request):
    if request.method == "GET":
        today = datetime.date.today()
        return render(request, "calendarApp/index.html", {
            "form" : EventForm(),
            "day"  : request.GET.get('day', str(today.day)),
            'month': request.GET.get('month', str(today.month)),
            'year' : request.GET.get('year', str(today.year)),
            "title": "Create Event"
        })

    form = EventForm(request.POST)
    if form.is_valid():
        date = f"{request.POST['year']}-{request.POST['month']}-{request.POST['day']}"

        participants = request.POST['participants']
        try:
            tmp_participants = get_participants(participants)
        except Exception as e:
            return render(request, "calendarApp/error.html", {
                "error_message" : str(e)
            })

        event = Event.objects.create(host=request.user, date=date,**form.cleaned_data)
        event.participants.add(request.user)
        for p in tmp_participants:
            event.participants.add(p)
        event.save()

        return HttpResponseRedirect(reverse("calendar"))

    return render(request, "calendarApp/index.html", {
            "form" : form,
            "day"  : request.POST['day'],
            'month': request.POST['month'],
            'year' : request.POST['year']
        })
    

# GET -> get profile page by user's id.
#       If user owns profile, show nex events this month
#       else If user is logged in, show events in common 
# PUT -> Edit bio or avatar from given user.
def profile(request, user_id):

    profile = User.objects.get(pk=user_id)

    # GET
    if request.method == 'GET':

        if request.user.is_authenticated:
            if request.user.id == profile.id: 
                # Next events this month.
                today = datetime.date.today()
                events = profile.events.filter(date__month=today.month, date__day__gte=today.day).order_by('date', 'time')
            else:
                # Events in common beetween profile and request.user
                events = []
                for x in profile.events.all():
                    if x.participants.filter(id=request.user.id):
                        events.append(x)

            paginator = Paginator(events, 1) # Show 1 events per page.
            page_number = request.GET.get('page')
            page_obj = paginator.get_page(page_number)

            return render(request, "calendarApp/profile.html", {
                "profile" : profile,
                "page_obj"  : page_obj
            })

        return render(request, "calendarApp/profile.html", {
                "profile" : profile
            })

    # PUT
    # User must own profile to edit it.
    if request.method == 'PUT':
        if not request.user.is_authenticated :
            return JsonResponse(data={'error' : 'User must be authenticated.'}, status=403)
        if request.user.id != profile.id:
            return JsonResponse(data={'error' : 'User can not edit this profile.'}, status=403)

        data = json.loads(request.body)
        if data.get("avatar") is not None:
            avatar = data['avatar']

            # Validate URL field.
            if len(avatar) <= 500:
                profile.avatar = avatar
                profile.save(update_fields=['avatar'])

            else: 
                return JsonResponse(data={ "error": 'URL is too long.'}, status=400)

        if data.get("bio") is not None:
            profile.bio = data['bio']
            profile.save(update_fields=['bio'])
    
        return JsonResponse(data={'bio': profile.bio, 'avatar': profile.avatar}, status=200)
    
    #POST
    return JsonResponse(data={'error' : 'Post requests are not allowed.'}, status=400)


# GET -> get event information given its id.
# PUT -> Edit participants from given event.
@login_required(login_url='login')
def event(request, event_id):

    event = Event.objects.get(pk=event_id)

    # GET
    # User must participate in event to view it.
    if request.method == "GET":
        if event.participants.filter(id=request.user.id):
            return JsonResponse(event.serialize(), safe=False, status=200)

        return JsonResponse(data={'error' : 'User does not participate in event.'}, status=403)


    # PUT
    # User must be the host to edit it.
    if request.method == 'PUT':
        if request.user.id != event.host.id:
            return JsonResponse(data={'error' : 'User must be the host to edit event.'}, status=403)


        data = json.loads(request.body)
        if data.get("add") is not None:
            try:
                add = get_participants(data['add'])
                for u in add:
                    event.participants.add(u)
            except Exception as e:
                return JsonResponse(data={'error' : str(e)}, status=400)

        if data.get("del") is not None:
            for usr_id in data['del']:
                event.participants.remove(User.objects.get(id=usr_id))

        return JsonResponse(data={'success': 'Changes made succesfully'}, status=200)

    if request.method == 'DELETE':
        if request.user.id != event.host.id:
            event.participants.remove(request.user)
        else:
            event.delete()
        return JsonResponse(data={'success': 'Changes made succesfully'}, status=200)

    # POST
    return JsonResponse(data={'error' : 'Post requests are not allowed.'}, status=400)
    

# Render calendar.html
def calendar(request): 
    return render(request, "calendarApp/calendar.html")

# Show all events from current user in given month.
def events_by_month(request, month): 
    if request.user.is_authenticated:
        events = request.user.events.filter(date__month=month)
        return JsonResponse([event.serialize() for event in events], safe=False, status=200)
    return JsonResponse(data={'error' : 'User must be authenticated.'}, status=400)

# Show all events from current user in given day of month.
def events_by_day(request, month, day): 
    if request.user.is_authenticated:
        events = request.user.events.filter(date__month=month, date__day=day)
        return JsonResponse([event.serialize() for event in events], safe=False, status=200)
    return JsonResponse(data={'error' : 'User must be authenticated.'}, status=400)