# Clients

## Why?
A subgroup of misfit datatypes have been growing in the SDK architecture. They do not conform to the principles or design patterns of Clean Architecture, but to bend their functionality in such a way would be counterproductive and create unintuitive patterns for the many traders, BUIDLers, and frontend providers who will one day use this codebase as a foundation.  

The current SDK structure is a rigid monolith. This may work well for a frontend application, but not for a frontend library. 

## How
Clients can be customized and configured at the root of the SDK. While we may provide "batteries included" defaults, these can be easily customized and extended by users to fit their needs. For example, a Cosmos wallet that wants to implement a swap widget in their UI should not be forced to run an ethereum client.

A client can be composed by itself without any additional application logic. Each family of clients implements a single interface or abstract class which defines their structure, universal methods, and shared return types. 

In addition, each member of a client family may inherit shared functionality from a parent class to avoid redundancy.


Like services, these: 
* Are not part of the domain 
* May return entities

Unlike services, these: 
* Are composed outside the sdk's scope
* Do not store application-specific state
* Independently configurable
* Extensible
* Reusable 
