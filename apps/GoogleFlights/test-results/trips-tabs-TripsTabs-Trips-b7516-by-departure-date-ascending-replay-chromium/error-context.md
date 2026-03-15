# Page snapshot

```yaml
- generic [ref=e3]:
  - navigation [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]: Flights
      - button "◀" [ref=e7] [cursor=pointer]
    - list [ref=e8]:
      - listitem [ref=e9]:
        - link "✈ Search" [ref=e10] [cursor=pointer]:
          - /url: /
          - generic [ref=e11]: ✈
          - generic [ref=e12]: Search
      - listitem [ref=e13]:
        - link "🌍 Explore" [ref=e14] [cursor=pointer]:
          - /url: /explore
          - generic [ref=e15]: 🌍
          - generic [ref=e16]: Explore
      - listitem [ref=e17]:
        - link "🧳 My Trips" [ref=e18] [cursor=pointer]:
          - /url: /trips
          - generic [ref=e19]: 🧳
          - generic [ref=e20]: My Trips
  - main [ref=e21]:
    - generic [ref=e22]:
      - heading "My Trips" [level=1] [ref=e23]
      - generic [ref=e24]:
        - button "Upcoming" [ref=e25] [cursor=pointer]
        - button "Past" [ref=e26] [cursor=pointer]
        - button "Tracked" [ref=e27] [cursor=pointer]
      - generic [ref=e28]:
        - generic [ref=e29]: ✈
        - paragraph [ref=e30]: No upcoming trips
        - paragraph [ref=e31]: Search for flights to plan your next trip!
```