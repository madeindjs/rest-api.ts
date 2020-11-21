require 'asciidoctor'
require 'asciidoctor-pdf'
require 'yaml'

LANGS = %w[en fr].freeze
OUTPUT_DIR = File.join __dir__, 'build'
THEMES_DIR = File.join __dir__, 'themes'
FONTS_DIR = File.join __dir__, 'fonts'

def check_args(args)
  lang = args[:lang]
  unless LANGS.include?(lang)
    msg = format('Lang not available. Select on of these langs: %s', LANGS.join(', '))
    raise ArgumentError, msg
  end


  lang
end

def in_filename(args)
  format('rest-api.ts/%s/main.adoc', args[:lang])
end

def out_filename(args, extension)
  format("rest-api-ts_%s.%s", args[:lang], extension)
end

namespace :build do
  desc 'Build for all languages'
  task :CI do
    builds = YAML.load(File.read("builds.yaml"))
    builds.each do |version, languages|
      languages.each do |language|
        puts "LANG: #{language}"
        args = { lang: language }
        Rake::Task['build:pdf'].execute(args)
        Rake::Task['build:html'].execute(args)
        Rake::Task['build:epub'].execute(args)
        # [temporary] no mobi build
        # TODO: fix when issue(https://github.com/tdtds/kindlegen/issues/42) solved
        # Rake::Task['build:mobi'].execute(args)
      end
    end
  end

  desc 'Build all versions'
  task :all, [:lang] do |_task, args|
    check_args(args)
    Rake::Task['build:pdf'].invoke(args[:lang])
    Rake::Task['build:epub'].invoke(args[:lang])
    Rake::Task['build:mobi'].invoke(args[:lang])
  end

  desc 'Build a PDF version'
  task :pdf, [:lang] do |_task, args|
    check_args(args)

    input = in_filename args
    output = out_filename args, 'pdf'

    Asciidoctor.convert_file input,
                             safe: :unsafe,
                             backend: 'pdf',
                             to_dir: OUTPUT_DIR,
                             mkdirs: true,
                             to_file: output,
                             attributes: {
                               'pdf-stylesdir' => THEMES_DIR,
                               'pdf-style' => 'my',
                               'pdf-fontsdir' => FONTS_DIR,
                             }


    # `asciidoctor-pdf #{input} --destination-dir build --out-file #{output}`
    puts "Book compiled on build/#{output}"
  end

  desc 'Build an HTML version'
  task :html, [:lang] do |_task, args|
    check_args(args)
    input = in_filename args
    output = out_filename args, 'html'
    `asciidoctor #{input} --destination-dir build --out-file #{output}`
    puts "Book compiled on build/#{output}"
  end

  desc 'Build an EPUB version'
  task :epub, [:lang] do |_task, args|
    check_args(args)
    input = in_filename args
    output = out_filename args, 'epub'
    `asciidoctor-epub3 #{input} --destination-dir build --out-file #{output}`
    puts "Book compiled on build/#{output}"
  end

  desc 'Build a MOBI version'
  task :mobi, [:version, :lang] do |_task, args|
    check_args(args)
    input = in_filename args
    output = out_filename args, 'mobi'
    `asciidoctor-epub3 #{input} --destination-dir build -a ebook-format=kf8 --out-file #{output}`
    puts "Book compiled on build/#{output}"
  end
end
