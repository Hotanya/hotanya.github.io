---
title: Fantastic GraphQL Bugs And Where To Find Them
date: '2024-09-17 18:00:00 +1200'
categories:
  - blog
tags:
  - GraphQL
  - AppSec
  - Hacking

---
# Fantastic GraphQL Bugs and Where to Find Them
## Intro

Back in 2022, I presented a [talk](https://youtube.com/watch?v=uTvspYJgMuM) at OWASP NZ Day about common GraphQL bugs that my colleagues and I had observed during our penetration testing work. This post will summarize a lot of that, as well as recommending some ways to mitigate these issues and secure GraphQL instances. Lets dig in!

## What is GraphQL

Simply put, GraphQL is a query language for APIs, similar to REST and SOAP. Originally created for internal use at Facebook, and was later open-sourced in 2015. It is schema based, and allows users to retrieve data in a more efficient manner.

### GraphQL vs REST

GraphQL was designed for efficiency, you retrieve only what you want, nothing more nothing less. This is beautifully shown in the image below:

| ![graphqlburger](https://s3.amazonaws.com/kinlane-productions2/graphql/DgsXLk_X4AEKiJJ.jpg) |
| :-----------------------------------------------------------------------------------------: |
|                                   GraphQL Burger Analogy                                    |

With REST, you retrieve the entire pre-defined contents of `/burger`, regardless of whether you need it or not. Whereas with GraphQL, you can pick the individual components of `burger` as defined in the schema. Don't like lettuce? Easy, no lettuce for you. Oh you want Bun Patty Patty Cheese Cheese Bun? Sure here you go!

If Hogwarts were to implement a system for keeping track of students and house points, the following diagram shows the differences between using REST and GraphQL for this.

| ![graphqlvsrest](/images/graphqlvsrest.png) |
| :--: |
| GraphQL vs REST |

Instead of maintaining three different API endpoints, this can all be handled by one GraphQL system.

## Queries and Mutations

Each system/software/etc has its own terminology, and GraphQL is no different. Here we have things called Queries and Mutations. 

| ![mutation.gif](https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbHBxdDczY2pwOWh0YzE1YjMwdWw4M3A4eTRmbjZxd2ExendscGYxZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l2Jeg1lGgEYY0l3l6/giphy.webp) |
| :--: |
|mutation dot gif|

Nothing to be alarmed about, Queries are basically `read` operations or `GET`  

| ![query](/images/Pasted%20image%2020240909164522.png) |
|:--:|
|GraphQL Query|

Mutations and change operations such as  `create, update and delete` or `POST, PUT DELETE`

|![mutation](/images/Pasted%20image%2020240909164547.png)|
|:--:|
|GraphQL Mutations|

## Accio Vulnerabilities

GraphQL isn't immune to many of the security vulnerabilities we see within APIs traditionally. We still have things such as:

* Insecure Direct Object Reference (IDOR)
* SQL Injection (SQLi)
* Broken Access Control
* Denial of Service (DoS)
* And more!

## Tools?

There is lots of helpful tooling out there that we can use to test GraphQL.

* Burp Suite Plugins - inQL and GraphQL Raider - These make your life so much easier when testing an application through the Burp Suite Proxy. 
* GraphQL Voyager - Maps out the GraphQL schema and gives us a nice visual representation.
* Insomnia.rest - API Client
* GraphQL itself 😏

## GraphQL Introspection

Introspection is a feature of GraphQL which allows you to query and retrieve the API schema to see what API functions are available for you. Good Guy GraphQL.

This is similar to how Swagger docs are sometimes available for REST APIs, and in both of these cases, it is generally a good idea to have these not available to the public.

In GraphQL, you use an **introspection** query to retrieve the scheme information. An example of a full query looks like this:

```json
{__schema{queryType{name}mutationType{name}subscriptionType{name}types{...FullType}directives{name description locations args{...InputValue}}}}fragment FullType on __Type{kind name description fields(includeDeprecated:true){name description args{...InputValue}type{...TypeRef}isDeprecated deprecationReason}inputFields{...InputValue}interfaces{...TypeRef}enumValues(includeDeprecated:true){name description isDeprecated deprecationReason}possibleTypes{...TypeRef}}fragment InputValue on __InputValue{name description type{...TypeRef}defaultValue}fragment TypeRef on __Type{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name ofType{kind name}}}}}}}}
```


<img src='https://github.com/Hotanya/hotanya.github.io/blob/master/images/graphqlClippy.png'>


Thanks ~~Clippy~~ GraphQL

Look for the following endpoints on GraphQL servers for inbuilt querying functionality:
* /v1/explorer
* /v1/graphiql
* /graph
* /graphql
* /graphql/console/
* /graphql.php
* /graphiql
* /graphiql.php

## It's GRAPH-queueee-ell not graphical

GraphQL Voyager is an excellent tool which can be used to map out the schema. Very helpful for complex schemas as it gives us a visual representation. Available as a service [online](https://graphql-kit.com/graphql-voyager/) as well as open-source an [package](https://github.com/graphql-kit/graphql-voyager).

Smaller schemas are easy to follow and read.

| ![simpleSchema](/images/simpleSchema.png) |
|:--:|
| A Simple Schema |

But it really shines with complex schemas as seen below:

|![complexSchema](/images/complexSchema.png)|
|:--:|
|A Complex Schema|

## Denial of Service (DoS)

As far as vulnerabilities go, DoS and DDoS get a lot of attention because of the widespread impact it can cause. Within a GraphQL environment, queries can get quite complex because they can be **nested and called recursively**.

Take an example of a blog:
* You would typically have Users and Posts. 
* A post has attributes such as title, author etc.
* Each user can have multiple posts
* Each post will have (at least) a user.
* We can call this recursively. 

e.g. 

| ![dos](/images/dos.png) |
|:--:| 
| Example of a recursive query |


By crafting increasingly complex queries, we can place additional load on the backend system, as seen in the images below:

| ![simpleQuery](/images/simpleQuery.png) | ![complexQuery](/images/complexQuery.png) |
|:--:|:--:|
| A Standard Query | A Recursive Query |

### DoS Mitigation

We can employ some simple techniques to mitigate the risk and impact of this issue:
* Limit Maximum Query Depth
	* By default, GraphQL sets this to max. This should be limited to something that makes sense for your application.
* Throttle Requests Based on Server Time or Query Complexity
* Audit Queries Before Production

Some useful links for this:
* https://www.npmjs.com/package/graphql-validation-complexity
* https://github.com/4Catalyzer/graphql-validation-complexity
* https://github.com/slicknode/graphql-query-complexity

## Insecure Direct Object Reference (IDOR)

<div class="myvideo">
   <video  style="display:block; width:100%; height:auto;" autoplay controls loop="loop">
       <source src="/images/IDOR.mp4" type="video/mp4" />
   </video>
</div>

This video shows a pretty standard blog site, with a login page and posts.  When we click on settings, we can only see our own info, which the API retrieves based on user ID. In this case, authorisation was not being checked, allowing us to see other user's settings. Depending on how the application is configured, this may lead to cross-tenant issues too! 


### IDOR Mitigation

* Use GUIDs instead of IDs. 
	* This is a defense-in-depth measure and increases the complexity of user IDs.
* Implement Role Based Access Controls (RBACs)
* Always validate that the user is authorised to perform the action that they are requesting.

## Injection

<div class="myvideo">
   <video  style="display:block; width:100%; height:auto;" autoplay controls loop="loop">
       <source src="/images/injection.mp4" type="video/mp4" />
   </video>
</div>

The video shows how SQL injection can be possible as GraphQL by default does not do any input sanitisation. The application has an admin panel which allows the user to ping a server and returns the status code. 

This application is taking our input and loading it directly into a SQL query. We can use the classic SQL test payload ` 'SLEEP(5)` . The server responds by responding after 5 seconds,

### Injection Mitigation

Same way we would mitigate traditional injection style attacks.
* Input Validation - All user input should be treated as untrusted and sanitised before being used by the application.
	* Ideally this should follow an allow-list approach as opposed to deny-list. Only allow your specified characters to be used.
	* In this case, for a server ping, make sure the input is numeric and/or matches IP Address formatting. 
* Use Parameterised queries.

## Real Life Examples

On a client engagement, we were once testing a crowdfunding style application using GraphQL. Front-end was configured securely and access-control was enforced well, however not on GraphQL...

We sent an introspection query to the GraphQL endpoint and got a full schema of the application functionality, which revealed a lot unused functionality, including admin functionality. 

Admins had the ability to allocate funds and approve funding requests etc, so we were basically able to request funding for a new project and approve it ourselves.

Oh, and this could all be done **unauthenticated**. 💀

![risk](/images/Pasted%20image%2020240917133417.png)

## Key Takeways

* Treat All User Input as Untrusted.
* Conduct Input Validation.
* Limit Query Depth.
* Enforce Robust Access Controls and Authorisation Checks.
* Don't Forget To Apply These Security Controls on GraphQL!
