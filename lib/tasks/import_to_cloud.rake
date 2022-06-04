namespace :import do
  desc 'import to cloud with account_id inbox_id'
  task :build, [:account_id, :inbox_id, :type, :password] => :environment do |_t, args|
    MigrateToCloud::ImportToCloud.new(
      account_id: args.account_id,
      inbox_id: args.inbox_id,
      password: args.password
    ).perform(args.type)
  end
end
