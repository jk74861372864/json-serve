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
  (let* ((skip (read-from-string (getf _parsed :|skip|)))
         (filter (getf _parsed :|filter|))
         (query (getf _parsed :|query|))
         (count (json-serve.search:count-objs
                 (if (string= filter "0") () filter)
                 (if (string= query "") () query)))
         (results (json-serve.search:search-objs
                   (if (not skip) 0 skip)
                   (if (string= filter "0") () filter)
                   (if (string= query "") () query))))
    (render-json (list count results))))

;;
;; Error pages

(defmethod on-exception ((app <web>) (code (eql 404)))
  (declare (ignore app))
  (merge-pathnames #P"_errors/404.html"
                   *template-directory*))
