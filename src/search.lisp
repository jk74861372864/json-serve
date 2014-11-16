
;; Search the objects collection in the Mongodb database for all
;; documents containing a description. Order by a the document title,
;; and support pages of 20 documents.

(in-package :cl-user)
(defpackage json-serve.search
  (:use :cl
		:cl-mongo
		:json-serve.config)
  (:export :count-objs
		   :search-objs))
(in-package :json-serve.search)

(defun count-objs (filter query)
  "Perform a search on the Mongodb document collection."
  (print query)
  (db.use (config :database))
  (let ((results (docs (db.count (config :collection)
								 (generate-json-query filter query)))))
	(doc-to-ht (car results))))

(defun search-objs (skip filter query)
  "Perform a search on the Mongodb document collection."
  (print (generate-json-query filter query))
  (db.use (config :database))
  (let ((docs (docs (db.sort (config :collection)
							 (generate-json-query filter query)
							 :limit 20
							 :skip skip
							 :field (config :title)))))
	(loop for doc in docs
	   collect (doc-to-ht doc))))

(defun generate-json-query (filter query)
  (if (and (not (null filter)) (not (null query)))
	  (return-from generate-json-query
		(kv
		 (kv (config :filter) filter)
		 (kv "$text" (kv "$search" query)))))
  (if (not (null filter))
	  (return-from generate-json-query
		(kv (config :filter) filter)))
  (if (not (null query))
	  (return-from generate-json-query
		(kv "$text" (kv "$search" query))))
  :all)

(defun doc-to-ht (doc)
  "Convert a Mongodb document object into a hash table."
  (let ((ht (slot-value doc 'cl-mongo::elements)))
	(loop for value being the hash-values of ht
	   using (hash-key key)
	   do (typecase value
			(cl-mongo:document (setf (gethash key ht) (slot-value value 'cl-mongo::elements)))
			(null (setf (gethash key ht) ""))
			(list (setf (gethash key ht) (loop for item in value collect (doc-to-ht item))))))
	ht))
