
;; Loads all the Json files found in the specified directory into the
;; Mongodb database.

;; Before:
;; db.objects.remove({});
;; db.objects.dropIndexes();

;; After:
;; db.objects.ensureIndex({title : 1}, {name: "title_index"});
;; db.objects.ensureIndex({ "$**": "text" },{ name: "TextIndex" });
;; db.objects.getIndexes();

(in-package :cl-user)
(defpackage json-serve.load
  (:use :cl
        :cl-fad
        :cl-mongo
        :json-serve.config
        :yason)
  (:export :process-directory))
(in-package :json-serve.load)

(defun process-directory ()
  (remove-data)
  (let ((dir (config :data-directory)))
    (walk-directory dir 'process-file))
  (add-indexes))

(defun process-file (path)
  (if (json-file-p (namestring path))
      (progn
        (print path)
        (let ((doc (ht->document (yason:parse (load-file path)))))
          (db.use (config :database))
          (db.insert (config :collection) doc)))))

(defun json-file-p (path)
  (if (< (length path) 5) (return-from json-file-p nil))
  (if (string= (subseq path (- (length path) 5)) ".json")
      t
      nil))

(defun load-file (path)
  (with-open-file (stream path)
    (let ((data (make-string (file-length stream))))
      (read-sequence data stream)
      data)))

(defun remove-data ()
  (db.use (config :database))
  (pp (db.eval (format nil "function () { db.~A.remove({});  }" (config :collection))))
  (pp (db.eval (format nil "function () { db.~A.dropIndexes();  }" (config :collection)))))

(defun add-indexes ()
  (db.use (config :database))
  (pp (db.eval (format nil "function () { db.~A.ensureIndex({title : 1}, {name: 'title_index'}); }" (config :collection))))
  (pp (db.eval (format nil "function () { db.~A.ensureIndex({ '$**': 'text' },{ name: 'TextIndex' }); }" (config :collection)))))
