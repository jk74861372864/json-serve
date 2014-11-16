(in-package :cl-user)
(defpackage json-serve-test-asd
  (:use :cl :asdf))
(in-package :json-serve-test-asd)

(defsystem json-serve-test
  :author "Jim Kennedy"
  :license ""
  :depends-on (:json-serve
               :cl-test-more)
  :components ((:module "t"
                :components
                ((:file "json-serve"))))
  :perform (load-op :after (op c) (asdf:clear-system c)))
