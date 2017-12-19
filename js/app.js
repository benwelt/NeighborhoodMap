
var breweries = [
  {
    name: 'Epic Brewing Company',
    location: {lat: 40.7511580, lng: -111.8878130}
  },
  {
    name: 'Fisher Brewing Company',
    location: {lat: 40.7521570, lng: -111.9004480}
  },
  {
    name: 'Proper Brewing Co.',
    location: {lat: 40.7505630, lng: -111.8906990}
  },
  {
    name: 'Shades of Pale Brewery',
    location: {lat: 40.7238790, lng: -111.8952380}
  },
  {
    name: 'RoHa Brewing Project',
    location: {lat: 40.7364690, lng: -111.8900970}
  },
  {
    name: 'Mountain West Cider',
    location: {lat: 40.7787720, lng: -111.9030370}
  },
  {
    name: 'Red Rock Brewing Co.',
    location: {lat: 40.7636480, lng: -111.8972400}
  }
];

var map;
var bounds;
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
  this.address = "";
  this.website = "";
  this.isOpen = "";
  this.placeID = "";
  this.infoWindowContent = "";
  this.defaultMarker = 'img/beer_icon_dark.png';
  this.highlightedMarker = 'img/beer_icon_light.png';

  var d = new Date();

  this.marker = new google.maps.Marker({
    position: self.position,
    title: self.title,
    map: map,
    icon: self.defaultMarker,
    animation: google.maps.Animation.DROP
  });

  this.setInfoWindowContent = function(marker, infoWindow) {
    var service = new google.maps.places.PlacesService(map);
    var weekday = d.getDay();

    service.textSearch({
      query: self.title,
      location: self.position
    }, function(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        infoWindow.marker = marker;
        self.placeID = place[0].place_id;
        self.infoWindowContent = "<div><strong>" + self.title + "</strong></div><br>"
      }

      if (self.placeID) {
        service.getDetails({
          placeId: self.placeID
        }, function(place, status) {
          self.address = place.formatted_address;
          self.website = place.website;
          for (var i=0; i<place.opening_hours.periods.length; i++) {
            if (i === weekday) {
              self.isOpen = place.opening_hours.periods[i].close.time;
            }
          }
          console.log("Open until " + self.isOpen);
          self.infoWindowContent += "<div>Open until " + self.isOpen + "</div>";
        });
      }

      infoWindow.setContent(self.infoWindowContent);
      infoWindow.open(map, marker);
      infoWindow.addListener('closeclick', function() {
        infoWindow.marker = null;
      });

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
  });

  this.menuClick = function(place) {
    google.maps.event.trigger(self.marker, 'click');
    map.setCenter(self.position);
    map.setZoom(14);
    // Animate marker
    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 3500);
    // Close nav pane when link is clicked
    $('.mdl-layout__drawer').removeClass('is-visible');
    $('.mdl-layout__obfuscator').removeClass('is-visible');
  }

}


function ViewModel() {
  var self = this;

  this.places = ko.observableArray([]);
  this.filter = ko.observable('');

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

  this.filteredBreweries = ko.computed(function() {
    var filter = self.filter().toLowerCase();
    if (!filter) {
      return self.places();
    } else {
      return ko.utils.arrayFilter(self.places(), function(place) {
        var name = place.title.toLowerCase().includes(filter);
        return name;
      });
    }
  }, self);

}

function initMap() {
  ko.applyBindings(new ViewModel());
}
