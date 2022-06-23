# Sandbox Pattern

## Purpose 
To implement a design of application sanxboxes in order to learn where this pattern may be useful as well as what the limitations of this pattern may be and how to migitate them.

## Local Development

1. Do `npm start` to launch the application


## Table of Contents

* [Overview](#overview)
* [Objective(s)](#objectives)
* [Architectural Notes](#architectural-notes)
* [References](#references)


## Overview <a name="overview"></a>
An first attempt at *an* implementation of Nicholas Zaka's Sandbox Pattern described in this [talk](https://www.youtube.com/watch?v=mKouqShWI4o). Slide deck available [here](https://www.slideshare.net/nzakas/scalable-javascript-application-architecture). 

The key insight from this talk is that large application archictectures can embrace pluggable modules and communication via events in order to remain stable and extensible as conditions and requirements.

Architectures that include components with too many direct connections among themselves results in tight coupling. Any change to any part of the architecture may have an unknown and unpredictable number of impacts as a result of these long chains of dependencies.

Events allow decoupling application modules from one another.

Another key reference for this specific attempt comes directly from Stoyan Stefanov's *Javascript Design Patterns*. The Sandbox Pattern feature in this book is the direct inspiration for this version of the implementation of application sandboxes. 

## Objective(s) <a name="objectives"></a>
Create an app that has the following key features:

| **Feature**                                                                                                                                                         |
|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|  Should be able to CRUD some basic resource(s)                                                                                                                      |
|  Should be composed a modules that have no knowledge of the larger application or its objectives                                                                    |
|  Should house modules that communicate with other modules or the core application either by emitted events or by exposing a limited API for peer modules to consume |
|  Should be able to stop and restart modules that are experiencing errors                                                                                            |
|  Should be able to recover/resume in-progress work on restarting a problem module                                                                                   |
|  Should be able to continue operating if a module is stopped indefinitely                                                                                           |
|  Should be able to inspect module metadata                                                                                                                          |
|  Should be able to expose a HTTP API for accessing CRUD-able resources                                                                                              |
|  Should be able to receive command messages to change application state via API                                                                                     |
|  Should be able to add plugins that enhance functionality provided by existing modules                                                                              |

## Architectural Notes <a name="architectural-notes"></a>
[Architectural notes go here]

## References <a name="references"></a>

* *JavaScript Design Patterns* by Stoyan Stefanov
* [Box Tech Talk: Scalable JavaScript Application Architecture by Nicholas Zakas](https://www.youtube.com/watch?v=mKouqShWI4o)
* Patterns For Large-Scale JavaScript Application Architectures by Addy Osmani
* [Addy Osmani - Scaling Your JavaScript Applications Part 1](https://www.youtube.com/watch?v=2g8AceFb0is)
* *Enterprise Integration Patterns* by Gregor Hohpe and Bobby Woolf


