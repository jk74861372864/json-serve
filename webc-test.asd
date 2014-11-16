(in-package :cl-user)
(defpackage webc-test-asd
  (:use :cl :asdf))
(in-package :webc-test-asd)

(defsystem webc-test
  :author "Jim Kennedy"
  :license ""
  :depends-on (:webc
               :cl-test-more)
  :components ((:module "t"
                :components
                ((:file "webc"))))
  :perform (load-op :after (op c) (asdf:clear-system c)))
