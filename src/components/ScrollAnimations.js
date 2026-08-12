'use client'

import { useEffect } from 'react'

export default function ScrollAnimations() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate')
          observer.unobserve(entry.target)
        }
      }),
      { threshold: 0.12 },
    )

    const observe = (root = document) => root.querySelectorAll('[data-aos]:not(.aos-animate)').forEach((element) => observer.observe(element))
    observe()

    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.matches?.('[data-aos]')) observer.observe(node)
        observe(node)
      }
    })))
    mutations.observe(document.body, { childList: true, subtree: true })
    return () => { observer.disconnect(); mutations.disconnect() }
  }, [])

  return null
}
