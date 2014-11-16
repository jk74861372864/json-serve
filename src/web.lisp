(in-package :cl-user)
(defpackage webc.web
  (:use :cl
        :caveman2
        :webc.config
        :webc.view
		:webc.search
        :datafly
        :sxql
		:yason)
  (:export :*web*))
(in-package :webc.web)

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
		 (count (webc.search:count-objs filter))
		 (results (webc.search:search-objs (if (not skip) 0 skip) filter)))
	(render-json (list count results))))

;;
;; Error pages

(defmethod on-exception ((app <web>) (code (eql 404)))
  (declare (ignore app))
  (merge-pathnames #P"_errors/404.html"
                   *template-directory*))
