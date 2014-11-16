
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

// tljs namespace.
(function( webcjs, $ ) {
	
	webcjs.total_results = 0;
	
	webcjs.current_page = 0;

	webcjs.total_pages = function () {
		return parseInt(webcjs.total_results / 20);
	};

	webcjs.first_page = function () {
		webcjs.current_page = 0;

		webcjs.search();		
	};
	
	webcjs.previous_page = function () {
		if (webcjs.current_page > 0) {
			webcjs.current_page--;
		}

		webcjs.search();		
	};

	webcjs.next_page = function () {
		if (webcjs.current_page < webcjs.total_pages()) {
			webcjs.current_page++;
		}

		webcjs.search();		
	};

	webcjs.last_page = function () {
		webcjs.current_page = webcjs.total_pages();

		webcjs.search();		
	};
	
    webcjs.init = function () {
		$('#filter').change(webcjs.change_filter);

		webcjs.search();
    };

	webcjs.change_filter = function () {
		webcjs.current_page = 0;

		webcjs.search();
	};

	webcjs.search = function () {
		$('#results').html("loading...");
		
		var skip = webcjs.current_page * 20;

		var filter = $("#filter").val();

		var url = "/search?skip={0}&filter={1}".format(skip, filter);
		
		var data = $.getJSON(url, webcjs.processResults);
	};

	webcjs.processResults = function (data) {
		webcjs.total_results = parseInt(data[0].n);

		var first_button = "<a class='btn btn-primary' href='#' role='button' id='first'>&laquo; First</a>";
		var previous_button = "<a class='btn btn-primary' href='#' role='button' id='previous'>&laquo; Previous</a>";
		var next_button = "<a class='btn btn-primary' href='#' role='button' id='next'>Next &raquo;</a>";
		var last_button = "<a class='btn btn-primary' href='#' role='button' id='last'>Last &raquo;</a>";
		
		var results = "<div class='row paging'><div class='col-xs-12'><p class='bs-component'>Showing page {0} of {1} ({2} results) {3} {4} {5} {6}</p></div></div>".format(
			webcjs.current_page + 1,
			webcjs.total_pages() + 1,
			webcjs.total_results,
			first_button,
			previous_button,
			next_button,
			last_button
		);
		
		results += "<div class='row'>";
		
		$.each( data[1], function( key, val ) {
			if (key % 4 === 0) {
				results += "</div><div class='row'>";
			}			
			results += webcjs.buildResult(val);			
		});

		results += "</div>"
		
		$('#results').html(results);

		$('#first').click(webcjs.first_page);
		$('#previous').click(webcjs.previous_page);
		$('#next').click(webcjs.next_page);
		$('#last').click(webcjs.last_page);
	};

	webcjs.buildResult = function (data) {
		var result = "<div id='{0}' class='col-xs-12 col-sm-6 col-md-6 col-lg-3'><div class='well'>".format(data.id);
		result += "<h3>{0}</h3>".format(data.title);
		result += "<p>{0}</p>".format(data.medium);
		result += "<p><a class='btn btn-primary' href='#' role='button'>View »</a></p>";
		result += "</div></div>";	
		return result;
	};
	
}( window.webcjs = window.webcjs || {}, jQuery));
