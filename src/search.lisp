
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

(defun count-objs (category free-text)
  "Perform a search on the Mongodb document collection."
  (db.use (config :database))
  (let ((results (docs (db.count (config :collection)
                                 (build-query category free-text)))))
    (doc-to-ht (car results))))

(defun search-objs (skip category free-text)
  "Perform a search on the Mongodb document collection."
  (db.use (config :database))
  (let ((docs (docs (db.sort (config :collection)
                             (build-query category free-text)
                             :limit 20
                             :skip skip
                             :field (config :title)))))
    (loop for doc in docs
       collect (doc-to-ht doc))))

(defun build-query (category free-text)
  (if (and (not (null category)) (not (null free-text)))
      (return-from build-query
        (kv
         (kv (config :category) category)
         (kv "$text" (kv "$search" free-text)))))
  (if (not (null category))
      (return-from build-query
        (kv (config :category) category)))
  (if (not (null free-text))
      (return-from build-query
        (kv "$text" (kv "$search" free-text))))
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
