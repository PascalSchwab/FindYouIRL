# FindYouIRL
Project for you own geo guessing game for irl streaming

```yaml
services:
  findirl:
    container_name: FindYouIrl
    image: findyouirl:latest
    ports:
      - "5000:5000"
    environment:
      - ADMIN_PW=test
      - CHANNEL_NAME=name
      - ACCESS_TOKEN=12345
      - CHANNEL_LIST=name1,name2
```