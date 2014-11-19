(in-package :cl-user)
(defpackage json-serve.web
  (:use :cl
        :caveman2
        :json-serve.config
        :json-serve.view
        :json-serve.search
        :datafly
        :sxql
        :yason)
  (:export :*web*))
(in-package :json-serve.web)

;;
;; Application

(defclass <web> (<app>) ())
(defvar *web* (make-instance '<web>))
(clear-routing-rules *web*)

;;
;; Routing rules
(defroute "/" ()
  (with-layout (:title "Web collection - search")
    (render #P"index.tmpl" `(:categories ,(config :categories)))))

(defroute "/search" (&key _parsed)
  (let* ((skip (process-param (read-from-string (getf _parsed :|skip|)) 0))
         (filter (process-param (getf _parsed :|filter|)))
         (query (process-param (getf _parsed :|query|)))
         (count (json-serve.search:count-objs filter query))
         (results (json-serve.search:search-objs skip filter query)))
    (render-json (list count results))))

(defun process-param (value &optional (default nil))
  (if (not value) (return-from process-param default))
  (if (string= value "0") (return-from process-param default))
  (if (string= value "") (return-from process-param default))
  value)

;;
;; Error pages

(defmethod on-exception ((app <web>) (code (eql 404)))
  (declare (ignore app))
  (merge-pathnames #P"_errors/404.html"
                   *template-directory*))
