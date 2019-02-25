'use strict;'
// Global Variables
var map, clientID, clientSecret;

function AppViewModel() {
    var self = this;

    this.searchOption = ko.observable("");
    this.markers = [];

    this.populateInfoWindow = function(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.setContent('');
            infowindow.marker = marker;

              //start wiki
              var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + marker.article + '&imlimit=5&format=json&callback=wikiCallback';
              $.ajax({
                url: wikiUrl,
                dataType: 'jsonp'
              }).done(function(data) {
                console.log(data);

                var urlLink = data[3][0];
                var description = data[2][0];

                if (urlLink === undefined) { //if no wiki entry found
                  infowindow.setContent('<div>' + '<h3>' + marker.name + '</h3>' + '<p>' + 'Sorry no wikipedia entries could be found to match this station.' + '</p>' + '</div>');
                  infowindow.open(map, marker);

                } else {
                  //Found a wiki entry, now create the output to the info display
                  infowindow.marker = marker;
                  infowindow.setContent('<div>' + '<h3>' + marker.name + '</h3>' + '<p>' + description + '<a href="' + urlLink + '" target="blank">' + '..' + ' Read More' + '</a>' + '</p>' + '</div>');
                  infowindow.open(map, marker);
                }

                // Error handling for if Wikipedia API call fails

              }).fail(function() {
                //Uh oh, something went terribly wrong!
                infowindow.setContent('<div>' + '<h3>' + marker.name + '</h3>' + '<p>' + 'Sorry no wikipedia entries could be found to match this station.' + '</p>' + '</div>');
                infowindow.open(map, marker);

              });

            this.htmlContent = '<div>' + '<h4 class="iw_title">' + marker.name +
                '</h4>';

            infowindow.open(map, marker);

            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    };

    this.populateAndBounceMarker = function() {
        self.populateInfoWindow(this, self.largeInfoWindow);
        this.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout((function() {
            this.setAnimation(null);
        }).bind(this), 1400);
    };

    this.initMap = function() {
        var mapCanvas = document.getElementById('map');
        var mapOptions = {
            center: new google.maps.LatLng(39.768402, -86.158066),
            zoom: 12,
            styles: styles
        };
        // Constructor creates a new map - only center and zoom are required.
        map = new google.maps.Map(mapCanvas, mapOptions);

        // Set InfoWindow
        this.largeInfoWindow = new google.maps.InfoWindow({maxWidth: 300});
        for (var i = 0; i < myLocations.length; i++) {
            this.markerTitle = myLocations[i].name;
            this.markerLat = myLocations[i].lat;
            this.markerLng = myLocations[i].lng;
            this.markerArticle = myLocations[i].article;
            // Google Maps marker setup
            this.marker = new google.maps.Marker({
                map: map,
                position: {
                    lat: this.markerLat,
                    lng: this.markerLng
                },
                name: this.markerTitle,
                lat: this.markerLat,
                lng: this.markerLng,
                article: this.markerArticle,
                id: i,
                animation: google.maps.Animation.DROP,
                icon: {
                      url: "http://maps.google.com/mapfiles/ms/icons/grn-pushpin.png"}
            });
            this.marker.setMap(map);
            this.markers.push(this.marker);
            this.marker.addListener('click', self.populateAndBounceMarker);
        }
    };

    this.initMap();

    this.locationListFilter = ko.computed(function() {
        var result = [];
        for (var i = 0; i < this.markers.length; i++) {
            var markerLocation = this.markers[i];
            if (markerLocation.name.toLowerCase().includes(this.searchOption()
                    .toLowerCase())) {
                result.push(markerLocation);
                this.markers[i].setVisible(true);
            } else {
                this.markers[i].setVisible(false);
            }
        }
        return result;
    }, this);
}

googleError = function googleError() {
    alert(
        'An error occurred while loading the Google map.  Refresh your browser and try again'
    );
};

function startApp() {
    ko.applyBindings(new AppViewModel());
}

$(document).ready(function() {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    $('#map').css('min-height', windowHeight);
    $('#sidebar').css('min-height', windowHeight);
  };
  setHeight();

  $(window).resize(function() {
    setHeight();
  });
})
