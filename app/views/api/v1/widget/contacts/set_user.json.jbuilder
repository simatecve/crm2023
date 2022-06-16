json.contact do
  json.id @contact.id
  json.name @contact.name
  json.email @contact.email
  json.phone_number @contact.phone_number
end if @contact

json.widget_auth_token @widget_auth_token if @widget_auth_token
