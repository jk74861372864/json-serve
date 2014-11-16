(in-package :cl-user)
(defpackage json-serve-asd
  (:use :cl :asdf))
(in-package :json-serve-asd)

(defsystem json-serve
  :version "0.1"
  :author "Jim Kennedy"
  :license ""
  :depends-on (:clack
               :caveman2
               :envy
               :cl-ppcre

               ;; HTML Template
               :cl-emb

               ;; for CL-DBI
               :datafly
               :sxql

			   ;; json-serve
			   :cl-fad
			   :cl-mongo
			   :yason)
  :components ((:module "src"
                :components
                ((:file "main" :depends-on ("config" "view"))
                 (:file "web" :depends-on ("view"))
                 (:file "view" :depends-on ("config"))
				 (:file "load" :depends-on ("config"))
				 (:file "search" :depends-on ("config"))
                 (:file "config"))))
  :description ""
  :in-order-to ((test-op (load-op json-serve-test))))
