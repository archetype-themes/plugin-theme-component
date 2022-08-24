#! /usr/bin/env node
import { env } from 'node:process'
import SectionBuilder from '../builders/SectionBuilder.js'

await SectionBuilder.build(env.npm_package_name)
