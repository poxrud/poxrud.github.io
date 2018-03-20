---
layout: post
category: posts
title: Why I switched to Jekyll from Octopress
author: Phil Oxrud
comments: true
---

A little background, [Octopress](http://www.octopress.com) is a framework for creating statically generated website blogs. These days most blogs are hosted on the Wordpress framework. However if you need a simple blog Wordpress
can be an overkill.  A statically generated website offers many benefits. You can host it anywhere, it does not require a separate database, and it is usually much faster than a dynamically generated website. 

In the last few years Octopress became a favourite among developers needing a quick and easy way to generate a static blog.  

Personally, I run a couple of my client's blogs on Octopress. However when it was time for me to write my personal blog I decided to go with [Jekyll](http://www.jekyllrb.com). Jekyll is a "blog aware" static website generator build by the people at github. In fact Octopress is actually built on top of Jekyll. 

I made my decision based on the following reasons:

- Octopress is outdated
- Most Octopress sites look the same
- Jekyll is more flexible

Let's break these down a little bit...

## Octopress is Outdated
At the time of this writing Octopress' main website has a latest release date of July 23rd, 2011.

Octopress comes bundled with a twitter widget that has been broken ever since twitter retired their public API in 2012. Even Octopress' own website still shows a broken "Status updating..." widget. 

## Most Octopress sites look the same
While it is possible to change your default theme, most users chose to not do so. I can always tell when someone is using an Octopress blog. A blog should be about the content but I would still prefer to see some originality in website creation. (This is the same issue I have with a lot of Bootstrap based sites).

## Jekyll is More Flexible
Jekyll is more than a blog generator, it is a static website generator. With Octopress you are limited to blogs whereas learning Jekyll will allow you to create non-blog websites. Many companies are now generating their corporate sites with jekyll and hosting them on Amazon's S3.

The [web team responsible](http://kylerush.net/blog/meet-the-obama-campaigns-250-million-fundraising-platform/) for raising money for Obama's campaign used Jekyll to generate the fund raising website. Their jekyll generated website raised over $250 million dollar and handled over 81m page views (with the help of a CDN).  

Finally I would like to conclude that if you like Octopress then please continue using it, it is a great framework. Just remember to fix/remove the twitter widget and please change your default theme. 

 



