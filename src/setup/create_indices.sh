#!/bin/bash

# Create the 'users' index
curl -X PUT "http://elasticsearch:9200/users" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "email": { "type": "keyword" },
      "localId": { "type": "keyword" },
      "accessToken": { "type": "text" },
      "refreshToken": { "type": "text" },
      "fetchedEmails": { "type": "boolean" }
    }
  }
}
'

# Create the 'email_messages' index
curl -X PUT "http://elasticsearch:9200/email_messages" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "messageId": { "type": "keyword" },
      "subject": { "type": "text" },
      "body": { "type": "text" },
      "receivedDate": { "type": "date" }
    }
  }
}
'

# Create the 'mailboxes' index
curl -X PUT "http://elasticsearch:9200/mailboxes" -H 'Content-Type: application/json' -d'
{
  "mappings": {
    "properties": {
      "userId": { "type": "keyword" },
      "mailboxId": { "type": "keyword" },
      "name": { "type": "text" },
      "type": { "type": "keyword" }
    }
  }
}
'
