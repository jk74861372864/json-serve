# json-serve

A web based system to search a collection of json documents.

- Based on the Caveman2 web framework
- Uses Mongodb for data storage and retrieval

## Configuration
The following values need to be set in the src/config.lisp file:

:data-directory - the file system directory where the json files are located
:database - the name of the Mongodb database to connect to 
:collection - the name of the Mongodb collection to store the data in
:title  - the name of the document property to use as a title
:filter - the name of the document property to segment data on
:categories - used in conjunction with the filter to provide a segmentation facility

## Running
(ql:quickload :json-serve)

### Loading data
(in-package :json-serve.load)
(process-directory)

### Starting the web site
(in-package :json-serve)
(json-serve:start 8080)

## Author

* Jim Kennedy
