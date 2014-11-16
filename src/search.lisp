
;; Search the objects collection in the Mongodb database for all
;; documents containing a description. Order by a the document title,
;; and support pages of 20 documents.

(in-package :cl-user)
(defpackage webc.search
  (:use :cl
		:cl-mongo
		:webc.config)
  (:export :count-objs
		   :search-objs))
(in-package :webc.search)

(defun count-objs (filter)
  "Perform a search on the Mongodb document collection."
  (db.use (config :database))
  (let ((results (docs (db.count (config :collection)
								 (kv (config :filter) filter)))))
	(doc-to-ht (car results))))

(defun search-objs (skip filter)
  "Perform a search on the Mongodb document collection."
  (db.use (config :database))
  (let ((docs (docs (db.sort (config :collection)
							 (kv (config :filter) filter)
							 :limit 20
							 :skip skip
							 :field (config :title)))))
	(loop for doc in docs
	   collect (doc-to-ht doc))))

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
