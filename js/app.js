
var breweries = [
  {
    name: 'Epic Brewing Company',
    location: {lat: 40.7511580, lng: -111.8878130},
    id: 0
  },
  {
    name: 'Fisher Brewing Company',
    location: {lat: 40.7521570, lng: -111.9004480},
    id: 1
  },
  {
    name: 'Proper Brewing Co.',
    location: {lat: 40.7505630, lng: -111.8906990},
    id: 2
  },
  {
    name: 'Shades of Pale Brewery',
    location: {lat: 40.7238790, lng: -111.8952380},
    id: 3
  },
  {
    name: 'RoHa Brewing Project',
    location: {lat: 40.7364690, lng: -111.8900970},
    id: 4
  },
  {
    name: 'Mountain West Cider',
    location: {lat: 40.7787720, lng: -111.9030370},
    id: 5
  },
  {
    name: 'Red Rock Brewing Co.',
    location: {lat: 40.7636480, lng: -111.8972400},
    id: 6
  }
];

var map;
var infoWindow;

// Resize and position the #map element when the window is resized
$(window).resize(function() {
  var headerHeight = $('header').height();
  var pageHeight = $(document).height();
  var mapHeight = 100-(headerHeight/pageHeight*100);
  $('#map').height(mapHeight + "%").css("top", headerHeight + "px");
}).resize();


function Brewery(place) {
  var self = this;

  this.title = place.name;
  this.position = place.location;
  this.id = place.id;
  this.address = "";
  this.phone = "";
  this.isOpen = "";
  this.placeID = "";
  this.currentTemp = "";
  this.currentWeather = "";
  this.weatherCode = "";
  this.weatherIcon = "";
  this.infoWindowContent = "";
  this.defaultMarker = 'img/beer_icon_dark.png';
  this.highlightedMarker = 'img/beer_icon_light.png';

  this.visible = ko.observable(true);
  this.headerWeather = ko.observable('');

  this.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    map: map,
    icon: self.defaultMarker,
    animation: google.maps.Animation.DROP
  });

  // Shows or hides markers
  this.showMarker = ko.computed(function() {
    if (self.visible() === true) {
      self.marker.setMap(map);
    }else {
      this.marker.setMap(null);
    }
  }, this);

  // Splits the formatted address result into an array
  this.formatAddress = function(address) {
    var addressArray = address.split(",");
    return addressArray;
  }

  // Get all of the place data for the marker
  this.setInfoWindowContent = function(marker, infoWindow) {
    var service = new google.maps.places.PlacesService(map);
    var url = "https://api.wunderground.com/api/bd499f20ed8dfbd6/hourly/q/" + self.position['lat'] + "," + self.position['lng'] + ".json";

    $.getJSON(url, function(data) {
      self.currentTemp = data.hourly_forecast[0].temp.english;
      self.currentWeather = data.hourly_forecast[0].condition;
      self.weatherCode = data.hourly_forecast[0].fctcode;
      self.weatherIcon = data.hourly_forecast[0].icon_url;
      self.headerWeather ("<h6>" + self.currentTemp + "°</h6>" + "<img src='" + self.weatherIcon + "'class='weather-icon' alt='weather icon'>");
    }).done(function() {

      service.textSearch({
        query: self.title,
        location: self.position
      }, function(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          infoWindow.marker = marker;
          self.placeID = place[0].place_id;

          if (self.placeID) {
            service.getDetails({
              placeId: self.placeID
            }, function(place, status) {
              if (status == google.maps.places.PlacesServiceStatus.OK) {
                self.address = self.formatAddress(place.formatted_address);
                self.phone = place.formatted_phone_number;
                if (place.opening_hours.open_now === true) {
                  self.isOpen = "Open Now";
                }else {
                  self.isOpen = "Closed Now";
                }
                self.openInfoWindow(marker, infoWindow);
              }else {
                alert("Place details could not be found. Try reloading the page.");
                infoWindow.marker = null;
              }
            });
          }
        }else {
          alert("Something went wrong. Try reloading the page.");
          infoWindow.marker = null;
        }
      });
    }).fail(function() {
      alert("Something went wrong. Try reloading the page.");
    });
  }

  // Populate and open info window
  this.openInfoWindow = function(marker, infoWindow) {
    self.infoWindowContent = "<div id='" + self.id + "'><h6><strong>" + self.title + "</strong></h6></div>";
    self.infoWindowContent += "<div><strong>" + self.isOpen + "</strong></div>";
    self.infoWindowContent += "<div>" + self.phone + "</div>";
    self.infoWindowContent += "<div>" + self.address[0] + "</div>";
    self.infoWindowContent += "<div>" + self.address[1] + ", " + self.address[2] + "</div><hr>";
    self.infoWindowContent += "<div>Current weather at " + self.title + " is " + self.currentTemp + "° and " + self.currentWeather.toLowerCase() + ".</div>"
    if (self.weatherCode > 8) {
      self.infoWindowContent += "<div>The weather is a little ugly. Get a beer and stay inside.</div>";
    }else if (self.currentTemp < 50) {
      self.infoWindowContent += "<div>It's a little chilly. Grab a beer and cozy up.</div>";
    }else {
      self.infoWindowContent += "<div>Get a beer and enjoy the weather!</div>";
    }

    infoWindow.setContent(self.infoWindowContent);
    infoWindow.open(map, marker);
    infoWindow.addListener('closeclick', function() {
      infoWindow.marker = null;
    });
  }

  // Change marker symbol on mouseover
  this.marker.addListener('mouseover', function() {
    this.setIcon(self.highlightedMarker);
  });
  this.marker.addListener('mouseout', function() {
    this.setIcon(self.defaultMarker);
  });

  // Open info window onclick
  this.marker.addListener('click', function() {
    self.setInfoWindowContent(this, infoWindow);
    self.bounce();
  });

  this.bounce = function() {
    // Animate marker
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 3500);
  }
}

  // Zooms into and animates marker when menu item is clicked
  this.menuClick = function(place) {
    google.maps.event.trigger(place.marker, 'click');
    map.setCenter(place.position);
    map.setZoom(14);
    // Close nav pane when link is clicked
    $('.mdl-layout__drawer').removeClass('is-visible');
    $('.mdl-layout__obfuscator').removeClass('is-visible');
  }



function ViewModel() {
  var self = this;

  this.places = ko.observableArray([]);
  this.filter = ko.observable('');
  this.placeID = ko.observable('');
  this.weather = ko.observable('');

  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.760772, lng: -111.898087},
    zoom: 14,
    fullscreenControl: false
  });

  infoWindow = new google.maps.InfoWindow();
  this.bounds = new google.maps.LatLngBounds();

  // Create Markers and Info Windows for all of the breweries
  breweries.forEach(function(brewery) {
    self.places.push(new Brewery(brewery));
    self.bounds.extend(brewery.location);
  });
  // Dynamically adjust bounds of map after markers are loaded
  map.fitBounds(this.bounds);

  self.places().forEach(function(place) {
    place.marker.addListener('click', function() {
      self.placeID(place.id);
    });
  });

  this.setHeaderWeather = ko.computed(function() {
    self.places().forEach(function(place) {
      if (self.placeID() == place.id) {
        self.weather(place.headerWeather());
      }
    });
  }, self);

  // Filters breweries when text is entered into the search
  this.filteredBreweries = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      self.places().forEach(function(place) {
        place.visible(true);
      });
      return self.places();
    } else {
      return ko.utils.arrayFilter(self.places(), function(place) {
        var name = place.title.toLowerCase().includes(filter);
        place.visible(name);
        return name;
      });
    }

  }, self);

}

function initMap() {
  ko.applyBindings(new ViewModel());
}

function mapError() {
  alert("The map has failed to load. Try reloading the page.");
}
