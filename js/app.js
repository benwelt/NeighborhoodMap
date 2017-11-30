function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.760772, lng: -111.898087},
    zoom: 13
  });
}



var ViewModel = function() {
  var self = this;

  this.setMapHeight = function() {
    this.headerHeight = ko.observable($('header').height());
    this.pageHeight = ko.observable($(document).height());
    this.mapHeight = ko.observable(100-(this.headerHeight()/this.pageHeight()*100));
  };


};

ko.applyBindings(new ViewModel());
