---
# You don't need to edit this file, it's empty on purpose.
# Edit theme's home layout instead if you wanna make some changes
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
layout: default
---

<h1>Posts</h1>
<ul>
  {% for post in site.posts %}
    <li>
      <h2 class="post__list">
        <a class="post__link" href="{{ post.url | relative_url }}">{{ post.title | escape }}</a>
      </h2>
      {% assign date_format = site.minima.date_format | default: "%b %-d, %Y" %}
      <span class="post__date">
        <svg class="icons">
          <use xlink:href="#calendar" />
        </svg>
      {{ post.date | date: date_format }}</span>
    </li>
  {% endfor %}
</ul>