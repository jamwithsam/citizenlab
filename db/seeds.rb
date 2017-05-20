# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


def create_comment_tree(idea, parent, depth=0)
  amount = rand(5/(depth+1))
  amount.times do |i|
    c = Comment.create({
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      author: User.offset(rand(User.count)).first,
      idea: idea,
      parent: parent
    })
    create_comment_tree(idea, c, depth+1)
  end
end

Tenant.create({
  name: 'local',
  host: 'localhost',
  settings: {
    core: {
      allowed: true,
      enabled: true,
      locales: ['en','nl'],
      organization_type: 'city',
      organization_name: {
        "en" => Faker::Address.city,
        "nl" => Faker::Address.city,
        "fr" => Faker::Address.city
      },
      timezone: "Europe/Brussels",
      style_main_bg: Faker::Color.hex_color,
      style_main_fg: Faker::Color.hex_color,
      style_accent_bg: Faker::Color.hex_color,
      style_accent_fg: Faker::Color.hex_color
    },
    facebook_login: {
      allowed: true,
      enabled: true,
      app_id: '307796929633098',
      app_secret: '28082a4c201d7cee136dbe35236e44cb'
    }
  }
})


Apartment::Tenant.switch('localhost') do

  User.create({
    first_name: 'Koen',
    last_name: 'Gremmelprez',
    email: 'koen@citizenlab.co',
    password: 'testtest',
    locale: 'en',
    roles: [
      {type: "admin"},
    ],
    gender: "male",
    domicile: 'outside',
    birthyear: 1987,
    education: 7
  })


  7.times do 
    User.create({
      first_name: Faker::Name.first_name,
      last_name: Faker::Name.last_name,
      email: Faker::Internet.email,
      password: 'testtest',
      locale: ['en','nl'][rand(1)],
      roles: rand(10) == 0 ? [{type: 'admin'}] : [],
      gender: %w(male female unspecified)[rand(3)]
    })
  end


  12.times do 
    Topic.create({
      title_multiloc: {
        "en": Faker::Lorem.word,
        "nl": Faker::Lorem.word
      },
      description_multiloc: {
        "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      }
    });
  end

  12.times do 
    Area.create({
      title_multiloc: {
        "en": Faker::Address.city,
        "nl": Faker::Address.city
      },
      description_multiloc: {
        "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      }
    });
  end

  Area.create({
    title_multiloc: {
      "en": "Westbrook",
      "nl": "Westbroek"
    },
    description_multiloc: {
      "en": "<p>The place to be these days</p>",
      "nl": "<p>Moet je geweest zijn</p>"
    }
  })

  4.times do
    project = Project.create({
      title_multiloc: {
        "en": "Renewing Westbrook parc",
        "nl": "Westbroek park vernieuwen"
      },
      description_multiloc: {
        "en" => "<p>Let's renew the parc at the city border and make it an enjoyable place for young and old.</p>",
        "nl" => "<p>Laten we het park op de grend van de stad vernieuwen en er een aangename plek van maken, voor jong en oud.</p>"
      }
    })

    start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
    rand(5).times do
      start_at += 1.days
      project.phases.create({
        title_multiloc: {
          "en": Faker::Lorem.sentence,
          "nl": Faker::Lorem.sentence
        },
        description_multiloc: {
          "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        },
        start_at: start_at,
        end_at: (start_at += rand(120).days)
      })
    end
    rand(5).times do
      start_at = Faker::Date.between(1.year.ago, 1.year.from_now)
      project.events.create({
        title_multiloc: {
          "en": Faker::Lorem.sentence,
          "nl": Faker::Lorem.sentence
        },
        description_multiloc: {
          "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
          "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
        },
        location_multiloc: {
          "en" => Faker::Address.street_address,
          "nl" => Faker::Address.street_address
        },
        start_at: start_at,
        end_at: start_at + rand(12).hours
      })
    end
  end


  30.times do 
    idea = Idea.create({
      "title_multiloc": {
        "en": Faker::Lorem.sentence,
        "nl": Faker::Lorem.sentence
      },
      body_multiloc: {
        "en" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl" => Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      },
      topics: rand(3).times.map{rand(Topic.count)}.uniq.map{|offset| Topic.offset(offset).first },
      areas: rand(3).times.map{rand(Area.count)}.uniq.map{|offset| Area.offset(offset).first },
      author: User.offset(rand(User.count)).first,
      project: Project.first,
      publication_status: 'published',
      images: [0,0,1,1,2][rand(5)].times.map{ Rails.root.join("spec/fixtures/image#{rand(20)}.png").open }
    })
    User.all.each do |u|
      r = rand(5)
      if r == 0
        Vote.create(votable: idea, user: u, mode: "down")
      elsif 0 < r && r < 3
        Vote.create(votable: idea, user: u, mode: "up")
      end
    end

    create_comment_tree(idea, nil)
  end

  5.times do 
    Page.create({
      title_multiloc: {
        "en" => Faker::Lorem.sentence,
        "nl" => Faker::Lorem.sentence
      },
      body_multiloc: {
        "en": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join,
        "nl": Faker::Lorem.paragraphs.map{|p| "<p>#{p}</p>"}.join
      }
    })
  end

end
